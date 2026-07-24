import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import CoachDashboard from './CoachDashboard';

/** Puanlama satirlari ayni etiketleri tasidigi icin bolume gore ariyoruz. */
function ratingButton(labelText: string, value: string) {
  const section = screen.getByText(labelText).closest('div')?.parentElement as HTMLElement;
  return within(section).getByRole('button', { name: value });
}

describe('CoachDashboard performans formu', () => {
  it('oyuncu secilmeden gonderilirse uyarir', async () => {
    const user = userEvent.setup();
    render(<CoachDashboard />);

    await user.click(screen.getByRole('button', { name: /Log Entry/ }));

    expect(screen.getByRole('alert')).toHaveTextContent('Once bir oyuncu seciniz.');
  });

  it('eksik puanlamada uyarir', async () => {
    const user = userEvent.setup();
    render(<CoachDashboard />);

    await user.selectOptions(screen.getByLabelText('Target Player'), '1');
    await user.click(screen.getByRole('button', { name: /Log Entry/ }));

    expect(screen.getByRole('alert')).toHaveTextContent('Uc puanlamayi da doldurunuz.');
  });

  it('tamamlanan girdide ortalamayi hesaplayip formu sifirlar', async () => {
    const user = userEvent.setup();
    render(<CoachDashboard />);

    await user.selectOptions(screen.getByLabelText('Target Player'), '1');
    await user.type(screen.getByLabelText('Coach Notes'), 'Gecis hizi iyi.');

    // Technical varsayilan olarak 7; digerlerini de 7 yapinca ortalama 7.0 olmali.
    await user.click(ratingButton('Physical Intensity', '7'));
    await user.click(ratingButton('Mental Sharpness', '7'));

    await user.click(screen.getByRole('button', { name: /Log Entry/ }));

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('K. Arslan (CM) - #08');
    expect(status).toHaveTextContent('7.0/10');

    expect(screen.getByLabelText('Target Player')).toHaveValue('');
    expect(screen.getByLabelText('Coach Notes')).toHaveValue('');
  });

  it('backend gerektiren Filter Roles butonu devre disi', () => {
    render(<CoachDashboard />);

    expect(screen.getByRole('button', { name: /Filter Roles/ })).toBeDisabled();
  });
});
