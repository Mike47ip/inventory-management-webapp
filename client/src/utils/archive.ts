export const getArchivedProducts = (): string[] => {
  try {
    const archived = localStorage.getItem('archivedProducts');
    return archived ? JSON.parse(archived) : [];
  } catch (error) {
    console.error('Error parsing archived products', error);
    return [];
  }
};

export const archiveProduct = (productId: string) => {
  const archived = getArchivedProducts();
  if (!archived.includes(productId)) {
    localStorage.setItem('archivedProducts', JSON.stringify([...archived, productId]));
  }
};

export const unarchiveProduct = (productId: string) => {
  const archived = getArchivedProducts();
  localStorage.setItem('archivedProducts', JSON.stringify(archived.filter(id => id !== productId)));
};