import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

// Enlaces del pie: el canal y el código del proyecto.
const CHANNEL_URL = 'https://www.youtube.com/channel/UCOwIey0vGlYkZBgF29ASn3A';
const GITHUB_URL = 'https://github.com/AguiCode7';

// Componente raíz: encabezado, página actual y pie.
@Component({
  selector: 'app-root',
  imports: [NgOptimizedImage, RouterLink, RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly channelUrl = CHANNEL_URL;
  protected readonly githubUrl = GITHUB_URL;
  protected readonly year = new Date().getFullYear();
}
