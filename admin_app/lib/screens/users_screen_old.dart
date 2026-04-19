import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../models/index.dart';
import '../providers/index.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({Key? key}) : super(key: key);

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UsersProvider>().fetchUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<UsersProvider>(
        builder: (context, usersProvider, _) {
          if (usersProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (usersProvider.users.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.people_outlined,
                    size: 64,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No users yet',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () =>
                context.read<UsersProvider>().fetchUsers(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: usersProvider.users.length,
              itemBuilder: (context, index) {
                final user = usersProvider.users[index];
                return _UserCard(
                  user: user,
                  onDeactivate: () => _confirmDeactivate(context, user),
                );
              },
            ),
          );
        },
      ),
    );
  }

  void _confirmDeactivate(BuildContext context, User user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Deactivate User'),
        content: Text(
          'Are you sure you want to deactivate ${user.fullName}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              context.read<UsersProvider>().deactivateUser(user.id);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Deactivate'),
          ),
        ],
      ),
    );
  }
}

class _UserCard extends StatelessWidget {
  final User user;
  final VoidCallback onDeactivate;

  const _UserCard({
    required this.user,
    required this.onDeactivate,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor:
              user.role == 'admin' ? Colors.red[200] : Colors.blue[200],
          child: Text(
            user.fullName.isNotEmpty
                ? user.fullName[0].toUpperCase()
                : 'U',
            style: const TextStyle(color: Colors.white),
          ),
        ),
        title: Text(user.fullName),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(user.email, style: const TextStyle(fontSize: 12)),
            Text(
              user.phone.isNotEmpty ? user.phone : 'No phone',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        trailing: PopupMenuButton(
          itemBuilder: (context) => [
            PopupMenuItem(
              child: Row(
                children: [
                  Icon(
                    user.isActive ? Icons.lock : Icons.lock_open,
                    color: user.isActive ? Colors.red : Colors.green,
                  ),
                  const SizedBox(width: 8),
                  Text(user.isActive ? 'Deactivate' : 'Activate'),
                ],
              ),
              onTap: user.isActive ? onDeactivate : null,
            ),
            PopupMenuItem(
              child: const Row(
                children: [
                  Icon(Icons.info),
                  SizedBox(width: 8),
                  Text('View Details'),
                ],
              ),
              onTap: () => _showUserDetails(context, user),
            ),
          ],
        ),
      ),
    );
  }

  void _showUserDetails(BuildContext context, User user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(user.fullName),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _DetailRow(
                label: 'Email',
                value: user.email,
              ),
              _DetailRow(
                label: 'Phone',
                value: user.phone.isNotEmpty ? user.phone : 'N/A',
              ),
              _DetailRow(
                label: 'Role',
                value: user.role.toUpperCase(),
              ),
              _DetailRow(
                label: 'Status',
                value: user.isActive ? 'Active' : 'Inactive',
              ),
              _DetailRow(
                label: 'Created',
                value: DateFormat('MMM dd, yyyy').format(user.createdAt),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}
