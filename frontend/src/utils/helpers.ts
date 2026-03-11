export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  // Si es string en formato YYYY-MM-DD, no convertir a Date para evitar problemas de timezone
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = date.split('-');
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  // Para otros casos, usar el método original
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
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
  descuento: number,
  aplicaIva: boolean = false
): { total_sin_iva: number; iva_valor: number; total: number } => {
  const subtotalItem = cantidad * precioUnitario * (1 - descuento / 100);
  const iva_valor = aplicaIva ? subtotalItem * 0.19 : 0;
  const total = subtotalItem + iva_valor;
  return { total_sin_iva: subtotalItem, iva_valor, total };
};

export const calcularTotalesCotizacion = (items: Array<{
  cantidad: number;
  precio_unitario: number;
  descuento_porcentaje: number;
  aplica_iva?: boolean;
}>) => {
  let subtotal = 0;
  let iva_valor = 0;
  
  items.forEach(item => {
    const { total, iva_valor: ivaItem } = calcularTotalItem(
      item.cantidad,
      item.precio_unitario,
      item.descuento_porcentaje,
      item.aplica_iva || false
    );
    subtotal += (total - ivaItem); // Subtotal sin IVA
    iva_valor += ivaItem;
  });

  return {
    subtotal,
    iva_porcentaje: 19,
    iva_valor,
    total: subtotal + iva_valor,
  };
};