export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const calcularTotalItem = (
  cantidad: number,
  precioUnitario: number,
  descuento: number
): number => {
  return cantidad * precioUnitario * (1 - descuento / 100);
};

export const calcularTotalesCotizacion = (items: Array<{
  cantidad: number;
  precio_unitario: number;
  descuento_porcentaje: number;
}>) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + calcularTotalItem(
      item.cantidad,
      item.precio_unitario,
      item.descuento_porcentaje
    );
  }, 0);

  return {
    subtotal,
    impuesto_valor: 0,
    total: subtotal,
  };
};