import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 320, height: 800, columns: 2 },
  { width: 768, height: 1024, columns: 3 },
  { width: 1280, height: 800, columns: 5 },
]) {
  test(`teclado, foco e layout em ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.route('https://**/*', (route) => route.abort());
    const runtimeErrors: string[] = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    await page.goto('/');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Ir para o conte\u00fado' });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();

    await page.reload();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const input = page.getByRole('searchbox', { name: 'Cidade' });
    await expect(input).toBeFocused();
    await page.keyboard.type('sao paulo');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toHaveText('Carregando...');
    await expect(input).toBeFocused();
    await expect(page.getByRole('button', { name: 'Buscar', exact: true })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await expect(page.getByText('23,1 \u00b0C')).toBeVisible();
    await expect(input).toBeFocused();
    await expect(
      page.getByText('Dados fict\u00edcios de S\u00e3o Paulo carregados em graus Celsius.'),
    ).toHaveAttribute('aria-live', 'polite');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const celsius = page.getByRole('button', { name: '\u00b0C', exact: true });
    await expect(celsius).toBeFocused();
    expect(
      await celsius.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--tw-ring-offset-width'),
      ),
    ).toBe('2px');
    expect(await celsius.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
      'none',
    );
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.getByText('73,6 \u00b0F')).toBeVisible();
    await expect(page.getByRole('button', { name: '\u00b0F', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('article')).toHaveCount(5);

    const layout = await page.evaluate(() => {
      const list = document.querySelector('main ul');
      if (!list) throw new Error('Lista de previsao ausente.');
      const cards = [...document.querySelectorAll('article')].map((element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
      });
      return {
        pageOverflow: document.documentElement.scrollWidth > window.innerWidth,
        textOverflow: [...document.querySelectorAll('h1, h2, h3, p, dt, dd, button, article')]
          .filter(
            (element) =>
              getComputedStyle(element).clip === 'auto' &&
              element.scrollWidth > element.clientWidth + 1,
          )
          .map((element) => element.textContent),
        columns: getComputedStyle(list).gridTemplateColumns.split(' ').length,
        cards,
      };
    });
    expect(layout.pageOverflow).toBe(false);
    expect(layout.textOverflow).toEqual([]);
    expect(layout.columns).toBe(viewport.columns);
    for (const [index, first] of layout.cards.entries()) {
      for (const second of layout.cards.slice(index + 1)) {
        expect(
          first.right <= second.left ||
            second.right <= first.left ||
            first.bottom <= second.top ||
            second.bottom <= first.top,
        ).toBe(true);
      }
    }
    await page.screenshot({
      path: testInfo.outputPath(`weather-${viewport.width}px.png`),
      fullPage: true,
    });
    expect(runtimeErrors).toEqual([]);
  });
}
