import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ description: "Satıcının profil URL'si" })
  profileUrl: string;

  @ApiProperty({ description: 'Satıcının adı' })
  sellerName: string;

  @ApiProperty({ description: 'Satıcının yıldız sayısı' })
  sellerStars: number;

  @ApiProperty({ description: "Ürün resim URL'si" })
  productImage: string;

  @ApiProperty({ description: "Ürün sayfası URL'si" })
  productUrl: string;

  @ApiProperty({ description: 'Ürün başlığı' })
  productTitle: string;

  @ApiProperty({ description: 'Ürün detayı' })
  productDetail: string;

  @ApiProperty({ description: 'Ürün fiyatı' })
  price: string;

  @ApiProperty({ description: 'Beğeni sayısı' })
  likes: number;

  @ApiProperty({ description: 'Yorum sayısı' })
  comments: number;
}

export class UserProfileDto {
  @ApiProperty({ description: "Profil resmi URL'si" })
  profileImageUrl: string;

  @ApiProperty({ description: 'Kullanıcı adı' })
  userName: string;

  @ApiProperty({ description: 'Son aktiflik zamanı' })
  lastActive: string;

  @ApiProperty({ description: 'Oylama bilgisi' })
  ratingInfo: string;

  @ApiProperty({ description: 'Takipçi sayısı' })
  followers: number;

  @ApiProperty({ description: 'Takip ettiği kişi sayısı' })
  following: number;

  @ApiProperty({ description: 'Kullanıcı açıklaması' })
  description: string;

  @ApiProperty({ description: 'Kullanıcının ürünleri', type: [ProductDto] })
  products: ProductDto[];
}
