export default async function fetchWithError(url, options) {
  const res = await fetch(url, options);

  if (res.status === 200) {
    const result = await res.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  }

  throw new Error(`Error ${res.status}: ${res.statusText}`);
}
