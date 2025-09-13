import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@bharatmonitor.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123', description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;
}
