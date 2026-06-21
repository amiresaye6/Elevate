import { PartialType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class createStackDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3, { message: 'Description must be at least 3 characters long' })
    @MaxLength(30, { message: 'Description must be at least 30 characters long' })
    name:string;

    @IsNotEmpty()
    @IsString()
    @MinLength(10, { message: 'Description must be at least 10 characters long' })
    @MaxLength(200, { message: 'Description must be at least 200 characters long' })
    description:string;
}

export class updateStackDto extends PartialType(createStackDto) {}