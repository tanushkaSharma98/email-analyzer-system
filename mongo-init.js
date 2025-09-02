// MongoDB initialization script
db = db.getSiblingDB('email-analyzer');

// Create a user for the application
db.createUser({
  user: 'email-analyzer-user',
  pwd: 'email-analyzer-password',
  roles: [
    {
      role: 'readWrite',
      db: 'email-analyzer'
    }
  ]
});

// Create indexes for better performance
db.emails.createIndex({ timestamp: -1 });
db.emails.createIndex({ esp: 1 });
db.emails.createIndex({ subject: 1 });
db.emails.createIndex({ from: 1 });

print('Database initialized successfully');
