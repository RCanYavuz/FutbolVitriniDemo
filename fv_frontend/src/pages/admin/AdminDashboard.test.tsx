import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminApi, type PendingUser } from '../../lib/admin.api';
import AdminDashboard from './AdminDashboard';

const pendingUser: PendingUser = {
  id: '04b2327b-cf17-44a9-a1e8-fca6e1c65389',
  name: 'Yeni Başvuru',
  email: 'yeni@example.com',
  role: 'Scout',
  date: '2026-07-23',
  status: 'Bekliyor',
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('istatistikleri ve bekleyen kullanicilari backendden yukler', async () => {
    vi.spyOn(adminApi, 'stats').mockResolvedValue({
      totalStaff: 17,
      activePlayers: 42,
      pendingApprovals: 1,
    });
    vi.spyOn(adminApi, 'pendingUsers').mockResolvedValue([pendingUser]);

    render(<AdminDashboard />);

    expect(await screen.findByText('Yeni Başvuru')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(adminApi.stats).toHaveBeenCalledOnce();
    expect(adminApi.pendingUsers).toHaveBeenCalledOnce();
  });

  it('backend kapaliysa mevcut mock verileri ve Turkce uyariyi korur', async () => {
    vi.spyOn(adminApi, 'stats').mockRejectedValue(new Error('sunucu kapali'));
    vi.spyOn(adminApi, 'pendingUsers').mockRejectedValue(new Error('sunucu kapali'));

    render(<AdminDashboard />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Örnek veriler gösteriliyor.',
    );
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('1.248')).toBeInTheDocument();
    expect(screen.getByText('8.430')).toBeInTheDocument();
    for (const button of screen.getAllByTitle('API bağlantısı gerekli')) {
      expect(button).toBeDisabled();
    }
  });

  it('onay 204 ile tamamlaninca kullaniciyi listeden kaldirir', async () => {
    const statsSpy = vi
      .spyOn(adminApi, 'stats')
      .mockResolvedValueOnce({
        totalStaff: 17,
        activePlayers: 42,
        pendingApprovals: 1,
      })
      .mockResolvedValueOnce({
        totalStaff: 18,
        activePlayers: 42,
        pendingApprovals: 0,
      });
    vi.spyOn(adminApi, 'pendingUsers').mockResolvedValue([pendingUser]);
    const approveSpy = vi.spyOn(adminApi, 'approve').mockResolvedValue();
    const user = userEvent.setup();

    render(<AdminDashboard />);
    expect(await screen.findByText('Yeni Başvuru')).toBeInTheDocument();

    await user.click(screen.getByTitle('Onayla'));

    await waitFor(() => expect(screen.queryByText('Yeni Başvuru')).not.toBeInTheDocument());
    expect(approveSpy).toHaveBeenCalledWith(pendingUser.id);
    expect(screen.getByRole('status')).toHaveTextContent('Yeni Başvuru adlı kullanıcı onaylandı.');
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(statsSpy).toHaveBeenCalledTimes(2);
  });

  it('ret istegi basarisizsa kullaniciyi koruyup hata gosterir', async () => {
    vi.spyOn(adminApi, 'stats').mockResolvedValue({
      totalStaff: 17,
      activePlayers: 42,
      pendingApprovals: 1,
    });
    vi.spyOn(adminApi, 'pendingUsers').mockResolvedValue([pendingUser]);
    vi.spyOn(adminApi, 'reject').mockRejectedValue(new Error('islem basarisiz'));
    const user = userEvent.setup();

    render(<AdminDashboard />);
    expect(await screen.findByText('Yeni Başvuru')).toBeInTheDocument();

    await user.click(screen.getByTitle('Reddet'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Yeni Başvuru adlı kullanıcının başvurusu reddedilemedi.',
    );
    expect(screen.getByText('Yeni Başvuru')).toBeInTheDocument();
  });
});
