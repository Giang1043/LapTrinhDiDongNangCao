import 'package:intl/intl.dart';

/// String and number formatting utilities
class Formatters {
  /// Format currency (Vietnamese Dong)
  static String formatCurrency(double amount) {
    final formatter = NumberFormat('#,###', 'vi_VN');
    return '${formatter.format(amount)} VNĐ';
  }

  /// Format large numbers with K, M suffix
  static String formatNumber(int number) {
    if (number >= 1000000) {
      return '${(number / 1000000).toStringAsFixed(1)}M';
    } else if (number >= 1000) {
      return '${(number / 1000).toStringAsFixed(1)}K';
    }
    return number.toString();
  }

  /// Format date to readable string
  static String formatDate(DateTime date) {
    final formatter = DateFormat('dd/MM/yyyy', 'vi_VN');
    return formatter.format(date);
  }

  /// Format date and time
  static String formatDateTime(DateTime dateTime) {
    final formatter = DateFormat('dd/MM/yyyy HH:mm', 'vi_VN');
    return formatter.format(dateTime);
  }

  /// Format time only
  static String formatTime(DateTime dateTime) {
    final formatter = DateFormat('HH:mm', 'vi_VN');
    return formatter.format(dateTime);
  }

  /// Get relative time (e.g., "2 hours ago")
  static String getRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inSeconds < 60) {
      return 'Vừa xong';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} phút trước';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} giờ trước';
    } else if (difference.inDays < 30) {
      return '${difference.inDays} ngày trước';
    } else {
      return formatDate(dateTime);
    }
  }

  /// Truncate text with ellipsis
  static String truncate(String text, int maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    return '${text.substring(0, maxLength)}...';
  }

  /// Capitalize first letter
  static String capitalize(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1);
  }

  /// Convert status to human-readable string
  static String getStatusLabel(String status) {
    const labels = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'preparing': 'Đang chuẩn bị',
      'shipping': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy',
      'active': 'Hoạt động',
      'inactive': 'Vô hiệu hóa',
    };
    return labels[status] ?? status;
  }

  /// Get percentage string
  static String getPercentage(double value, double total) {
    if (total == 0) return '0%';
    final percentage = (value / total * 100).toStringAsFixed(1);
    return '$percentage%';
  }
}
