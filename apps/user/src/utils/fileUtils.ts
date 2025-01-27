export const validateFiles = (files: File[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;
  
    // Check number of files
    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }
  
    // Validate each file
    files.forEach(file => {
      // Check file type
      if (!validImageTypes.includes(file.type)) {
        errors.push(`Invalid file type: ${file.name}`);
      }
  
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`File too large: ${file.name} (max 5MB)`);
      }
    });
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  export const createImagePreviews = (files: File[]) => {
    return files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
  };