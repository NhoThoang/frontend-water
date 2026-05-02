import Swal from 'sweetalert2';

export const showToast = (icon: 'success' | 'error' | 'warning' | 'info', title: string) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
  Toast.fire({
    icon,
    title,
    background: 'var(--background)',
    color: 'var(--foreground)',
    customClass: {
      popup: 'swal-toast-popup',
    }
  });
};

export const showAlert = (icon: 'success' | 'error' | 'warning' | 'info', title: string, text?: string) => {
  return Swal.fire({
    icon,
    title,
    text,
    background: 'var(--background)',
    color: 'var(--foreground)',
    confirmButtonColor: 'var(--primary)',
    customClass: {
      popup: 'swal-modal-popup',
      confirmButton: 'swal-confirm-button',
      title: 'swal-title',
      htmlContainer: 'swal-text'
    },
    buttonsStyling: false,
  });
};
