export class Validator {
  errors: string[];

  constructor() {
    this.errors = [];
  }

  // 文字列が必須かどうかをチェックするメソッド
  isRequired(value: string, fieldName: string) {
    if (!value.trim()) {
      this.errors.push(`${fieldName} is required.`);
      return false;
    }
    return true;
  }

  // 文字列の最小長をチェックするメソッド
  minLength(value: string, minLength: number, fieldName: string) {
    if (value.length < minLength) {
      this.errors.push(`${fieldName} must be at least ${minLength} characters long.`);
      return false;
    }
    return true;
  }

  // メールアドレス形式かどうかをチェックするメソッド
  isEmail(value: string, fieldName: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      this.errors.push(`${fieldName} must be a valid email address.`);
      return false;
    }
    return true;
  }

  // Check if the phone number is in the correct format
  isPhoneNumber(phoneNumber: string): boolean {
    // Japanese phone number format: Mobile (090/080/070) or Landline (Area code 2-4 digits - Phone number)
    const phoneNumberPattern = /^0\d{1,4}-\d{1,4}-\d{4}$/;
    if (!phoneNumberPattern.test(phoneNumber)) {
      this.errors.push('Invalid phone number format.');
      return false;
    }
    return true;
  }

  // 郵便番号を形式チェック関数
  isPostalCode(postalCode: string) {
    // 日本の郵便番号形式: 3桁-4桁
    const postalCodePattern = /^\d{3}-\d{4}$/;
    if (!postalCodePattern.test(postalCode)) {
      this.errors.push('Invalid postal code format.');
      return false;
    }
    return true;
  }

  // エラーチェック
  hasErrors() {
    return this.errors.length > 0;
  }

  // エラーメッセージ取得
  getErrors() {
    return this.errors;
  }

  // エラーリセット
  clearErrors() {
    this.errors = [];
  }
}
