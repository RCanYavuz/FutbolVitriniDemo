import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../../store/authStore';
import type { UserRole, UserSubRole } from '../../store/types';
import ProtectedRoute from './ProtectedRoute';

const initialState = useAuthStore.getState();

function signIn(role: UserRole, subRole: UserSubRole) {
  useAuthStore.setState({
    isAuthenticated: true,
    user: { id: 'u-1', name: 'Test Kullanici', role, subRole, avatarUrl: '' },
  });
}

/** Korumali sayfayi, hedef adresleri gorunur kilan bir router icinde render eder. */
function renderAt(path: string, element: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={element} />
        <Route path="/login" element={<p>giris ekrani</p>} />
        <Route path="/vitrin" element={<p>vitrin paneli</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState(initialState, true);
  });

  it('oturum yoksa giris ekranina yonlendirir', () => {
    renderAt(
      '/club',
      <ProtectedRoute>
        <p>gizli icerik</p>
      </ProtectedRoute>,
    );

    expect(screen.getByText('giris ekrani')).toBeInTheDocument();
    expect(screen.queryByText('gizli icerik')).not.toBeInTheDocument();
  });

  it('rol uyuyorsa icerigi gosterir', () => {
    signIn('club', 'scout');

    renderAt(
      '/club',
      <ProtectedRoute allowedRoles={['club']}>
        <p>gizli icerik</p>
      </ProtectedRoute>,
    );

    expect(screen.getByText('gizli icerik')).toBeInTheDocument();
  });

  it('rol uymuyorsa kullanicinin kendi paneline yonlendirir', () => {
    signIn('player', 'player');

    renderAt(
      '/admin',
      <ProtectedRoute allowedRoles={['admin']}>
        <p>admin icerigi</p>
      </ProtectedRoute>,
    );

    expect(screen.getByText('vitrin paneli')).toBeInTheDocument();
    expect(screen.queryByText('admin icerigi')).not.toBeInTheDocument();
  });

  it('alt rol uymuyorsa erisimi engeller', () => {
    signIn('club', 'coach');

    // Uygulamadaki gercek durum: scout'a ozel eski adresler /club'a duser.
    renderAt(
      '/scouting-hub/showcase',
      <ProtectedRoute allowedRoles={['club']} allowedSubRoles={['scout']}>
        <p>scout icerigi</p>
      </ProtectedRoute>,
    );

    expect(screen.queryByText('scout icerigi')).not.toBeInTheDocument();
    expect(screen.getByText('vitrin paneli')).toBeInTheDocument();
  });
});
