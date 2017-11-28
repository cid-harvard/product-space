const getPromise = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();

  // TODO: figure out what's the correct type for `e` and remove type casts:
  reader.onload = (event: any) => {
    resolve(event.target.result as string);
  };
  reader.onerror = (e: any) => reject(e);
  reader.readAsText(file);
});

export default getPromise;
