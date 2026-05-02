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
    background: 'transparent',
    customClass: {
      popup: 'swal-toast-popup',
      title: 'swal-toast-title',
    }
  });
};

export const showAlert = (icon: 'success' | 'error' | 'warning' | 'info', title: string, text?: string, showCancelButton: boolean = false) => {
  return Swal.fire({
    icon,
    title,
    text,
    showCancelButton,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy bỏ',
    background: 'transparent',
    customClass: {
      popup: 'swal-modal-popup',
      confirmButton: 'swal-confirm-button',
      cancelButton: 'swal-cancel-button',
      title: 'swal-title',
      htmlContainer: 'swal-text',
      actions: 'swal-actions'
    },
    buttonsStyling: false,
  });
};
