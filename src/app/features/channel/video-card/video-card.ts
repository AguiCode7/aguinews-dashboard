import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../../../shared/ui/icon';
import { Video } from '../data/video';

// Tarjeta de un video o Short: miniatura, título y fecha. Abre YouTube en otra pestaña.
@Component({
  selector: 'app-video-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, NgOptimizedImage, Icon],
  templateUrl: './video-card.html',
})
export class VideoCard {
  readonly video = input.required<Video>();
}
