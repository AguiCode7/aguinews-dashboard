import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Icon } from '../../../shared/ui/icon';
import { ChannelApi } from '../data/channel-api';
import { VideoKind } from '../data/video';
import { VideoCard } from '../video-card/video-card';

// Cuántos videos se piden de cada tipo (el tope real lo pone la API).
const VIDEOS_SHOWN = 50;

// Filtros de la página: todos, solo videos o solo Shorts.
const FILTERS = [
  { label: 'Todos', kind: undefined },
  { label: 'Videos', kind: 'Video' },
  { label: 'Shorts', kind: 'Short' },
] as const;

// Página "Videos": todo lo publicado en el canal, con filtro por tipo.
@Component({
  selector: 'app-videos-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, VideoCard],
  templateUrl: './videos-page.html',
})
export class VideosPage {
  private readonly api = inject(ChannelApi);

  private readonly all = this.api.latest(VIDEOS_SHOWN);

  protected readonly filters = FILTERS;
  protected readonly kind = signal<VideoKind | undefined>(undefined);
  protected readonly channelUrl = environment.channelUrl;
  protected readonly instagramUrl = environment.instagramUrl;

  protected readonly isLoading = computed(() => this.all.isLoading());
  protected readonly failed = computed(() => !!this.all.error());

  private readonly loaded = computed(() =>
    this.all.hasValue() ? this.all.value() : [],
  );

  // Con "Todos" se ven dos bloques (videos y Shorts) porque tienen formatos distintos.
  protected readonly longVideos = computed(() =>
    this.kind() === 'Short'
      ? []
      : this.loaded().filter((v) => v.kind === 'Video'),
  );
  protected readonly shorts = computed(() =>
    this.kind() === 'Video'
      ? []
      : this.loaded().filter((v) => v.kind === 'Short'),
  );
  protected readonly isEmpty = computed(
    () => !this.longVideos().length && !this.shorts().length,
  );

  protected retry(): void {
    this.all.reload();
  }
}
