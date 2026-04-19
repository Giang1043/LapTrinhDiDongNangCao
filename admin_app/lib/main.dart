import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/api_service.dart';
import 'providers/index.dart';
import 'screens/intro_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

// Modern Dark Theme Colors
const Color _darkBgPrimary = Color(0xFF121212);      // Scaffold background
const Color _darkBgCard = Color(0xFF1E1E1E);         // Card/Surface background
const Color _darkDivider = Color(0xFF2C2C2C);        // Divider
const Color _accentPrimary = Color(0xFF4338CA);      // Primary accent
const Color _accentLight = Color(0xFF6366F1);        // Lighter accent
const Color _textPrimary = Color(0xFFE0E0E0);        // High-emphasis text
const Color _textSecondary = Color(0xFFA0A0A0);      // Medium-emphasis text

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize API service
  final apiService = ApiService();
  await apiService.init();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => OrdersProvider()),
        ChangeNotifierProvider(create: (_) => ProductsProvider()),
        ChangeNotifierProvider(create: (_) => UsersProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, _) {
          return MaterialApp(
            title: 'FoodApp Admin',
            theme: _lightTheme,
            darkTheme: _darkTheme,
            themeMode: themeProvider.isDarkMode ? ThemeMode.dark : ThemeMode.light,
            home: const AuthWrapper(),
            routes: {
              '/login': (context) => const LoginScreen(),
              '/home': (context) => const HomeScreen(),
            },
            debugShowCheckedModeBanner: false,
          );
        },
      ),
    );
  }
}

// Light Theme - Modern Material 3 with elevated design
final ThemeData _lightTheme = ThemeData(
  primaryColor: Color(0xFF1976D2),
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: Color(0xFF1976D2),
    brightness: Brightness.light,
    surface: Colors.white,
    surfaceTint: Color(0xFF1976D2),
  ),
  fontFamily: 'Roboto',
  
  // Scaffold
  scaffoldBackgroundColor: Color(0xFFF5F5F5),
  
  // AppBar - Elevated with subtle shadow
  appBarTheme: AppBarTheme(
    backgroundColor: Colors.white,
    elevation: 1,
    scrolledUnderElevation: 0,
    surfaceTintColor: Colors.transparent,
    iconTheme: IconThemeData(color: Color(0xFF212121)),
    titleTextStyle: TextStyle(
      color: Color(0xFF1976D2),
      fontSize: 20,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.5,
    ),
    shape: Border(
      bottom: BorderSide(color: Color(0xFFE0E0E0), width: 1),
    ),
  ),
  
  // Drawer
  drawerTheme: DrawerThemeData(
    backgroundColor: Colors.white,
    elevation: 0,
  ),
  
  // Card - Elevated with subtle shadow
  cardColor: Colors.white,
  cardTheme: CardThemeData(
    color: Colors.white,
    elevation: 1,
    shadowColor: Colors.black12,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
  ),
  
  // Canvas & Dialog
  canvasColor: Color(0xFFF5F5F5),
  dialogBackgroundColor: Colors.white,
  dialogTheme: DialogThemeData(
    backgroundColor: Colors.white,
    elevation: 8,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    titleTextStyle: TextStyle(
      color: Color(0xFF212121),
      fontSize: 20,
      fontWeight: FontWeight.w600,
    ),
    contentTextStyle: TextStyle(
      color: Color(0xFF757575),
      fontSize: 16,
      fontWeight: FontWeight.w400,
    ),
  ),
  
  // ListTile
  listTileTheme: ListTileThemeData(
    selectedColor: Color(0xFF1976D2),
    selectedTileColor: Color(0xFFE3F2FD),
    textColor: Color(0xFF212121),
    subtitleTextStyle: TextStyle(color: Color(0xFF757575), fontSize: 13),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
  ),
  
  // Divider
  dividerTheme: DividerThemeData(
    color: Color(0xFFE0E0E0),
    thickness: 1,
    space: 0,
  ),
  
  // Text Theme
  textTheme: TextTheme(
    displayLarge: TextStyle(color: Color(0xFF212121), fontWeight: FontWeight.bold),
    displayMedium: TextStyle(color: Color(0xFF212121), fontWeight: FontWeight.bold),
    displaySmall: TextStyle(color: Color(0xFF212121), fontWeight: FontWeight.bold),
    headlineLarge: TextStyle(color: Color(0xFF212121), fontWeight: FontWeight.w600),
    headlineMedium: TextStyle(color: Color(0xFF212121), fontWeight: FontWeight.w600),
    headlineSmall: TextStyle(color: Color(0xFF212121), fontWeight: FontWeight.w600),
    titleLarge: TextStyle(color: Color(0xFF212121), fontWeight: FontWeight.w500),
    titleMedium: TextStyle(color: Color(0xFF212121), fontWeight: FontWeight.w500),
    titleSmall: TextStyle(color: Color(0xFF212121), fontWeight: FontWeight.w500),
    bodyLarge: TextStyle(color: Color(0xFF212121)),
    bodyMedium: TextStyle(color: Color(0xFF212121)),
    bodySmall: TextStyle(color: Color(0xFF757575)),
    labelLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
    labelMedium: TextStyle(color: Color(0xFF212121), fontWeight: FontWeight.w500),
    labelSmall: TextStyle(color: Color(0xFF757575)),
  ),
  
  // Input Decoration
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: Color(0xFFF5F5F5),
    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: Color(0xFFE0E0E0), width: 1),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: Color(0xFFE0E0E0), width: 1),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: Color(0xFF1976D2), width: 2),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: Colors.red, width: 1),
    ),
    labelStyle: TextStyle(color: Color(0xFF757575)),
    hintStyle: TextStyle(color: Color(0xFFBDBDBD)),
  ),
  
  // Switch
  switchTheme: SwitchThemeData(
    thumbColor: MaterialStateProperty.resolveWith((states) {
      if (states.contains(MaterialState.selected)) {
        return Colors.white;
      }
      return Color(0xFFBDBDBD);
    }),
    trackColor: MaterialStateProperty.resolveWith((states) {
      if (states.contains(MaterialState.selected)) {
        return Color(0xFF1976D2);
      }
      return Color(0xFFE0E0E0);
    }),
  ),
  
  // Button Themes
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: Color(0xFF1976D2),
      foregroundColor: Colors.white,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    ),
  ),
  
  textButtonTheme: TextButtonThemeData(
    style: TextButton.styleFrom(
      foregroundColor: Color(0xFF1976D2),
      splashFactory: InkRipple.splashFactory,
    ),
  ),
  
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: Color(0xFF1976D2),
      side: BorderSide(color: Color(0xFFE0E0E0)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    ),
  ),
  
  // Icon Themes
  iconTheme: IconThemeData(color: Color(0xFF212121)),
  primaryIconTheme: IconThemeData(color: Color(0xFF1976D2)),
  
  // Chip Theme
  chipTheme: ChipThemeData(
    backgroundColor: Color(0xFFF5F5F5),
    selectedColor: Color(0xFFE3F2FD),
    disabledColor: Color(0xFFE0E0E0),
    labelStyle: TextStyle(color: Color(0xFF212121)),
    secondaryLabelStyle: TextStyle(color: Color(0xFF1976D2)),
    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8),
      side: BorderSide(color: Color(0xFFE0E0E0)),
    ),
  ),
  
  // SnackBar
  snackBarTheme: SnackBarThemeData(
    backgroundColor: Color(0xFF323232),
    contentTextStyle: TextStyle(color: Colors.white),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
  ),
  
  // Progress Indicator
  progressIndicatorTheme: ProgressIndicatorThemeData(
    color: Color(0xFF1976D2),
    linearTrackColor: Color(0xFFE0E0E0),
  ),
  
  // Tab Bar
  tabBarTheme: TabBarThemeData(
    unselectedLabelColor: Color(0xFF757575),
    labelColor: Color(0xFF1976D2),
    indicatorColor: Color(0xFF1976D2),
    dividerColor: Color(0xFFE0E0E0),
  ),
);

// Modern Dark Theme
final ThemeData _darkTheme = ThemeData(
  primaryColor: _accentPrimary,
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: _accentPrimary,
    brightness: Brightness.dark,
    surface: _darkBgCard,
    surfaceTint: _accentPrimary,
    outline: _darkDivider,
  ),
  fontFamily: 'Roboto',
  
  // Scaffold
  scaffoldBackgroundColor: _darkBgPrimary,
  
  // AppBar
  appBarTheme: AppBarTheme(
    backgroundColor: _darkBgCard,
    elevation: 0,
    scrolledUnderElevation: 0,
    surfaceTintColor: Colors.transparent,
    iconTheme: IconThemeData(color: _textPrimary),
    titleTextStyle: TextStyle(
      color: _accentPrimary,
      fontSize: 20,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.5,
    ),
    shape: Border(
      bottom: BorderSide(color: _darkDivider, width: 1),
    ),
  ),
  
  // Drawer
  drawerTheme: DrawerThemeData(
    backgroundColor: _darkBgPrimary,
    elevation: 0,
  ),
  
  // Card
  cardColor: _darkBgCard,
  cardTheme: CardThemeData(
    color: _darkBgCard,
    elevation: 1,
    shadowColor: Colors.black26,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
  ),
  
  // Canvas & Dialog
  canvasColor: _darkBgCard,
  dialogBackgroundColor: _darkBgCard,
  dialogTheme: DialogThemeData(
    backgroundColor: _darkBgCard,
    elevation: 8,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    titleTextStyle: TextStyle(
      color: _textPrimary,
      fontSize: 20,
      fontWeight: FontWeight.w600,
    ),
    contentTextStyle: TextStyle(
      color: _textSecondary,
      fontSize: 16,
      fontWeight: FontWeight.w400,
    ),
  ),
  
  // ListTile
  listTileTheme: ListTileThemeData(
    selectedColor: _accentLight,
    selectedTileColor: _darkDivider,
    textColor: _textPrimary,
    subtitleTextStyle: TextStyle(color: _textSecondary, fontSize: 13),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
  ),
  
  // Divider
  dividerTheme: DividerThemeData(
    color: _darkDivider,
    thickness: 1,
    space: 0,
  ),
  
  // Text Theme
  textTheme: TextTheme(
    displayLarge: TextStyle(color: _textPrimary, fontWeight: FontWeight.bold),
    displayMedium: TextStyle(color: _textPrimary, fontWeight: FontWeight.bold),
    displaySmall: TextStyle(color: _textPrimary, fontWeight: FontWeight.bold),
    headlineLarge: TextStyle(color: _textPrimary, fontWeight: FontWeight.w600),
    headlineMedium: TextStyle(color: _textPrimary, fontWeight: FontWeight.w600),
    headlineSmall: TextStyle(color: _textPrimary, fontWeight: FontWeight.w600),
    titleLarge: TextStyle(color: _textPrimary, fontWeight: FontWeight.w500),
    titleMedium: TextStyle(color: _textPrimary, fontWeight: FontWeight.w500),
    titleSmall: TextStyle(color: _textPrimary, fontWeight: FontWeight.w500),
    bodyLarge: TextStyle(color: _textPrimary),
    bodyMedium: TextStyle(color: _textPrimary),
    bodySmall: TextStyle(color: _textSecondary),
    labelLarge: TextStyle(color: _textPrimary, fontWeight: FontWeight.w600),
    labelMedium: TextStyle(color: _textPrimary, fontWeight: FontWeight.w500),
    labelSmall: TextStyle(color: _textSecondary),
  ),
  
  // Input Decoration
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: Color(0xFF2A2A2A),
    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: _darkDivider, width: 1),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: _darkDivider, width: 1),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: _accentPrimary, width: 2),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: BorderSide(color: Colors.red, width: 1),
    ),
    labelStyle: TextStyle(color: _textSecondary),
    hintStyle: TextStyle(color: Color(0xFF666666)),
  ),
  
  // Switch
  switchTheme: SwitchThemeData(
    thumbColor: MaterialStateProperty.resolveWith((states) {
      if (states.contains(MaterialState.selected)) {
        return Colors.white;
      }
      return _textSecondary;
    }),
    trackColor: MaterialStateProperty.resolveWith((states) {
      if (states.contains(MaterialState.selected)) {
        return _accentPrimary;
      }
      return _darkDivider;
    }),
  ),
  
  // Button Themes
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: _accentPrimary,
      foregroundColor: Colors.white,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    ),
  ),
  
  textButtonTheme: TextButtonThemeData(
    style: TextButton.styleFrom(
      foregroundColor: _accentPrimary,
      splashFactory: InkRipple.splashFactory,
    ),
  ),
  
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: _accentPrimary,
      side: BorderSide(color: _darkDivider),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    ),
  ),
  
  // Icon Themes
  iconTheme: IconThemeData(color: _textPrimary),
  primaryIconTheme: IconThemeData(color: _accentPrimary),
  
  // Chip Theme
  chipTheme: ChipThemeData(
    backgroundColor: _darkBgCard,
    selectedColor: _accentLight,
    disabledColor: _darkDivider,
    labelStyle: TextStyle(color: _textPrimary),
    secondaryLabelStyle: TextStyle(color: _accentLight),
    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8),
      side: BorderSide(color: _darkDivider),
    ),
  ),
  
  // SnackBar
  snackBarTheme: SnackBarThemeData(
    backgroundColor: Color(0xFF2A2A2A),
    contentTextStyle: TextStyle(color: _textPrimary),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
  ),
  
  // Progress Indicator
  progressIndicatorTheme: ProgressIndicatorThemeData(
    color: _accentPrimary,
    linearTrackColor: _darkDivider,
  ),
  
  // Tab Bar
  tabBarTheme: TabBarThemeData(
    unselectedLabelColor: _textSecondary,
    labelColor: _accentPrimary,
    indicatorColor: _accentPrimary,
    dividerColor: _darkDivider,
  ),
);

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _showIntro = true;

  @override
  Widget build(BuildContext context) {
    if (_showIntro) {
      return IntroScreen(
        onDone: () {
          setState(() {
            _showIntro = false;
          });
        },
      );
    }

    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        if (authProvider.isAuthenticated) {
          return const HomeScreen();
        } else {
          return const LoginScreen();
        }
      },
    );
  }
}
