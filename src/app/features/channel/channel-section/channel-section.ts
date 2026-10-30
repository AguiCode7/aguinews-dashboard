import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Icon } from '../../../shared/ui/icon';
import { ChannelApi } from '../data/channel-api';
import { VideoCard } from '../video-card/video-card';

// Cuántos Shorts se muestran en la portada junto al último video.
const SHORTS_SHOWN = 3;

// Sección "Desde el canal" de la portada: el último video y los últimos Shorts.
@Component({
  selector: 'app-channel-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, VideoCard],
  templateUrl: './channel-section.html',
})
export class ChannelSection {
  private readonly api = inject(ChannelApi);

  private readonly videos = this.api.latest(1, 'Video');
  private readonly shorts = this.api.latest(SHORTS_SHOWN, 'Short');

  // Si la API falla, la sección simplemente no aparece.
  protected readonly latestVideo = computed(() =>
    this.videos.hasValue() ? this.videos.value()[0] : undefined,
  );
  protected readonly latestShorts = computed(() =>
    this.shorts.hasValue() ? this.shorts.value() : [],
  );

  protected readonly channelUrl = environment.channelUrl;
  protected readonly instagramUrl = environment.instagramUrl;
}
