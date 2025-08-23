// lib/apiProduct.ts

export async function uploadProduct(formData: FormData): Promise<any> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch('http://localhost:4000/api/products/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${JSON.parse(token)}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      success: false,
      message: data?.message || 'Something went wrong',
    };
  }

  return {
    success: true,
    message: data?.message,
  };
}
