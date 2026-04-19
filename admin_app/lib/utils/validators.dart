/// Input validation utilities for forms
class Validators {
  /// Validate email format
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    if (!emailRegex.hasMatch(value)) {
      return 'Enter a valid email';
    }
    return null;
  }

  /// Validate password
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }

  /// Validate product name
  static String? validateProductName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Product name is required';
    }
    if (value.length < 3) {
      return 'Product name must be at least 3 characters';
    }
    if (value.length > 100) {
      return 'Product name cannot exceed 100 characters';
    }
    return null;
  }

  /// Validate price
  static String? validatePrice(String? value) {
    if (value == null || value.isEmpty) {
      return 'Price is required';
    }
    final price = double.tryParse(value);
    if (price == null || price <= 0) {
      return 'Price must be a positive number';
    }
    return null;
  }

  /// Validate category name
  static String? validateCategoryName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Category name is required';
    }
    if (value.length < 3) {
      return 'Category name must be at least 3 characters';
    }
    return null;
  }

  /// Validate URL
  static String? validateUrl(String? value) {
    if (value == null || value.isEmpty) {
      return null; // URL is optional
    }
    try {
      Uri.parse(value);
      return null;
    } catch (e) {
      return 'Enter a valid URL';
    }
  }

  /// Validate stock quantity
  static String? validateStock(String? value) {
    if (value == null || value.isEmpty) {
      return null; // Stock is optional
    }
    final stock = int.tryParse(value);
    if (stock == null || stock < 0) {
      return 'Stock must be a non-negative number';
    }
    return null;
  }

  /// Validate phone number
  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Phone is required';
    }
    if (value.length < 10) {
      return 'Phone must be at least 10 characters';
    }
    return null;
  }

  /// Validate required field
  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }
    return null;
  }
}
