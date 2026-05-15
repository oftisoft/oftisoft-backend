import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';

class GenerateContentDto {
  message: string;
  pageKey?: string;
}

class ChatResponseDto {
  response: string;
}

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generateContent(@Body() dto: GenerateContentDto): Promise<ChatResponseDto> {
    const response = await this.aiService.generateResponse(dto.message, dto.pageKey);
    return { response };
  }
}
