// User roles
type UserRole = 'admin' | 'editor' | 'viewer';

// Current user context (simplified)
const currentUser = {
  id: 1,
  name: 'John Doe',
  roles: ['viewer'] as UserRole[]
};

// Decorator factory for role-based access control
function AllowedRoles(...allowedRoles: UserRole[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const hasPermission = allowedRoles.some(role =>
        currentUser.roles.includes(role)
      );
      if (!hasPermission) {
        throw new Error(
          `User ${currentUser.name} is not authorized to call ${propertyKey}`
        );
      }
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}

// Using the decorator
class DocumentService {
  @AllowedRoles('admin', 'editor')
  deleteDocument(id: string) {
    console.log(`Document ${id} deleted`);
  }
  @AllowedRoles('admin', 'editor', 'viewer')
  viewDocument(id: string) {
    console.log(`Viewing document ${id}`);
  }
}

// Usage
const docService = new DocumentService();
try {
  docService.viewDocument('doc123'); // Works - viewer role is allowed
  docService.deleteDocument('doc123'); // Throws error - viewer cannot delete
} catch (error) {
  console.error(error.message);
}
// Change user role to admin
currentUser.roles = ['admin'];
docService.deleteDocument('doc123'); // Now works - admin can delete
