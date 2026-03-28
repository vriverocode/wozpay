export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string, cedula?: string): PasswordValidationResult {
  const errors: string[] = [];

  // Mínimo 8 caracteres
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  // Al menos una mayúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }

  // Al menos una minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }

  // Al menos un número
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  // Al menos un símbolo
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Debe contener al menos un símbolo especial');
  }

  // No correlativos ascendentes
  const ascendingPatterns = [
    '012345', '123456', '234567', '345678', '456789',
    '0123456', '1234567', '2345678', '3456789',
    '01234567', '12345678', '23456789'
  ];
  
  for (const pattern of ascendingPatterns) {
    if (password.includes(pattern)) {
      errors.push('No puede contener números correlativos (ej: 12345678)');
      break;
    }
  }

  // No correlativos descendentes
  const descendingPatterns = [
    '987654', '876543', '765432', '654321', '543210',
    '9876543', '8765432', '7654321', '6543210',
    '98765432', '87654321', '76543210'
  ];
  
  for (const pattern of descendingPatterns) {
    if (password.includes(pattern)) {
      errors.push('No puede contener números correlativos inversos (ej: 987654321)');
      break;
    }
  }

  // No patrones repetitivos simples
  const repetitivePatterns = [
    '000', '111', '222', '333', '444', '555', '666', '777', '888', '999',
    '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999'
  ];
  
  for (const pattern of repetitivePatterns) {
    if (password.includes(pattern)) {
      errors.push('No puede contener patrones repetitivos (ej: 000111)');
      break;
    }
  }

  // No puede ser igual al número de cédula
  if (cedula && password.includes(cedula)) {
    errors.push('La contraseña no puede contener tu número de cédula');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  percentage: number;
} {
  let score = 0;

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

  // Bonus por variedad de caracteres
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 10;
  if (uniqueChars >= 12) score += 10;

  const percentage = Math.min(score, 100);

  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (percentage < 40) strength = 'weak';
  else if (percentage < 60) strength = 'medium';
  else if (percentage < 80) strength = 'strong';
  else strength = 'very-strong';

  return { strength, percentage };
}
