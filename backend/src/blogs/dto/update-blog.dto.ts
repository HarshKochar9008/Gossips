import { IsString, IsOptional, IsBoolean, MaxLength, IsNotEmpty } from 'class-validator';

export class UpdateBlogDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  summary?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  excerpt?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
