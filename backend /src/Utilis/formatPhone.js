function FormatPhone(telefone) {
  if (!telefone) return null;

  let digits = String(telefone).replace(/\D/g, '');
  digits = digits.replace(/^0+/, '');

  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits;
  }

  return digits;
}

module.exports = FormatPhone;