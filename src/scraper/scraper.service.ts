import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { ProductDto, UserProfileDto } from './dto/product.dto';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

@Injectable()
export class ScraperService {
    private async getBrowser() {
        const isDev = process.env.NODE_ENV !== 'production';
        
        if (isDev) {
            return await puppeteer.launch({
                executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process'
                ]
            });
        } else {
            return await puppeteer.launch({
                args: [
                    ...chromium.args,
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage'
                ],
                executablePath: await chromium.executablePath(),
                headless: true,
            });
        }
    }

    private async getPageContent(url: string): Promise<string> {
        const browser = await this.getBrowser();
        try {
            const page = await browser.newPage();
            
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
            });
            
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            });
            
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 60000 
            });
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const content = await page.content();
            return content;
        } finally {
            await browser.close();
        }
    }

    async scrapeProductList(url: string): Promise<ProductDto[]> {
        try {
            const data = await this.getPageContent(url);
            const $ = cheerio.load(data);

            const products: ProductDto[] = [];

            $('.four-cols .col-xs-6.col-md-3').each((i, element) => {
                const product: ProductDto = new ProductDto();

                const profileLink = $(element).find('.detail-head .img-title-block a').attr('href');
                product.profileUrl = profileLink || null;

                const sellerName = $(element).find('.detail-head .title-stars-block .title').text().trim();
                product.sellerName = sellerName || null;

                const stars = $(element).find('.detail-head .stars-holder .icon-star').length;
                product.sellerStars = stars;

                const imgDiv = $(element).find('.img-block .bgstretch');
                const imgStyle = imgDiv.attr('style');
                const imgId = imgDiv.attr('id');
                product.productImage = imgId || imgStyle || null;

                const productLink = $(element).find('.img-block a').attr('href');
                product.productUrl = productLink || null;

                const productTitle = $(element).find('.detail-footer .title-info-block .title').text().trim();
                const productDetail = $(element).find('.detail-footer .title-info-block .detail').text().trim();
                product.productTitle = productTitle || null;
                product.productDetail = productDetail || null;

                const price = $(element).find('.detail-footer .price-detail .price').text().trim();
                product.price = price || null;

                const likesText = $(element).find('.like-comment-list .like .numbers').text().trim();
                const likes = parseInt(likesText) || 0;
                product.likes = likes;

                const commentsText = $(element).find('.like-comment-list .comment .numbers').text().trim();
                const comments = parseInt(commentsText) || 0;
                product.comments = comments;

                products.push(product);
            });

            return products;
        } catch (error) {
            console.error('Scrape error:', error);
            throw new HttpException(`Ürün listesi çekilirken bir hata oluştu: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async scrapeProduct(url: string) {
        try {
            const data = await this.getPageContent(url);
            const $ = cheerio.load(data);

            const images = [];
            $('.slideset-holder .slideset .slide').each((i, element) => {
                const imgSrc = $(element).find('img.lazy').attr('src');
                if (imgSrc) images.push(imgSrc);
            });

            const title = $('.detail-block .title-holder h1').text().trim();
            const subtitles = [];
            $('.detail-block .title-holder .subtitle').each((i, element) => {
                subtitles.push($(element).text().trim());
            });
            const price = $('.detail-block .price-block .price-detail .price').text().trim();

            const personImgStyle = $('.detail-block .profile-block .person-img').attr('style');
            const personImgMatch = personImgStyle ? personImgStyle.match(/url\((.*?)\)/) : null;
            const personImg = personImgMatch ? personImgMatch[1].replace(/['"]+/g, '') : null;

            const profileTitle = $('.detail-block .profile-block .title-stars-block .title').text().trim();
            const stars = $('.detail-block .profile-block .stars-holder .icon-star').length;

            const comments = [];
            $('.comments-block .comments-list').each((i, element) => {
                const comment = $(element).find('.comment-holder p').first().text().trim();
                const replies = [];
                $(element)
                    .find('.replies-list .comment-holder p')
                    .each((j, replyElement) => {
                        replies.push($(replyElement).text().trim());
                    });
                comments.push({ comment, replies });
            });

            return {
                images,
                title,
                subtitles,
                price,
                personImg,
                profileTitle,
                stars,
                comments,
            };
        } catch (error) {
            console.error('Scrape product error:', error);
            throw new HttpException(`Ürün bilgileri çekilirken bir hata oluştu: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async scrapeUserProfile(url: string): Promise<UserProfileDto> {
        try {
            const data = await this.getPageContent(url);
            const $ = cheerio.load(data);

            const userProfile: UserProfileDto = new UserProfileDto();

            const profileImage = $('.clipImage-image').attr('xlink:href');
            userProfile.profileImageUrl = profileImage || null;

            const userName = $('.main-profile-block .title-block h1').text().trim();
            userProfile.userName = userName || null;

            const lastActive = $('.main-profile-block .title-block .time').text().trim();
            userProfile.lastActive = lastActive || null;

            const ratingInfo = $('.main-profile-block .stars-block .likes-info').first().text().trim();
            userProfile.ratingInfo = ratingInfo || null;

            const followers = $('.main-profile-block .followers-list li').first().find('strong').text().trim();
            const following = $('.main-profile-block .followers-list li').last().find('strong').text().trim();
            userProfile.followers = parseInt(followers) || 0;
            userProfile.following = parseInt(following) || 0;

            const userDescription = $('.main-profile-block .text-block p').text().trim();
            userProfile.description = userDescription || null;

            userProfile.products = [];

            $('.four-cols .col-xs-6.col-md-3').each((i, element) => {
                const product: ProductDto = new ProductDto();

                const productTitle = $(element).find('.detail-footer .title-info-block .title').text().trim();
                const productDetail = $(element).find('.detail-footer .title-info-block .detail').text().trim();
                product.productTitle = productTitle || null;
                product.productDetail = productDetail || null;

                const price = $(element).find('.detail-footer .price-detail .price').text().trim();
                product.price = price || null;

                const imgDiv = $(element).find('.img-block .bgstretch');
                const imgId = imgDiv.attr('id');
                product.productImage = imgId || null;

                const productLink = $(element).find('.img-block a').attr('href');
                product.productUrl = productLink || null;

                const likesText = $(element).find('.like-comment-list .like .numbers').text().trim();
                const likes = parseInt(likesText) || 0;
                product.likes = likes;

                const commentsText = $(element).find('.like-comment-list .comment .numbers').text().trim();
                const comments = parseInt(commentsText) || 0;
                product.comments = comments;

                userProfile.products.push(product);
            });

            return userProfile;
        } catch (error) {
            console.error('Scrape user profile error:', error);
            throw new HttpException(`Kullanıcı profili çekilirken bir hata oluştu: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
