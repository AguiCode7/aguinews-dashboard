import { parseNewsItems } from './news-item';

describe('parseNewsItems', () => {
  it('separa el emoji, el titular, el enlace y el dominio', () => {
    const [item] = parseNewsItems(
      '🤖 Nueva versión de .NET https://www.example.com/dotnet',
    );

    expect(item).toEqual({
      icon: '🤖',
      headline: 'Nueva versión de .NET',
      url: 'https://www.example.com/dotnet',
      domain: 'example.com',
    });
  });

  it('ignora líneas vacías y acepta noticias sin enlace ni emoji', () => {
    const items = parseNewsItems('\n  Solo un titular  \n\n');

    expect(items).toEqual([
      { icon: null, headline: 'Solo un titular', url: null, domain: null },
    ]);
  });
});
