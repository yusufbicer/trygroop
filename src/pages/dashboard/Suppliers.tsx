
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSuppliers } from '@/hooks/useSuppliers';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { CustomButton } from '@/components/ui/CustomButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Truck, Plus, Edit, Trash, Mail, Phone, MapPin, User } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Supplier } from '@/types/data';

const Suppliers = () => {
  const { user } = useAuth();
  const { suppliers, isLoading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers(user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  });

  const filteredSuppliers = suppliers.filter((supplier) => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || ''
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (editingSupplier) {
      updateSupplier.mutate({
        id: editingSupplier.id,
        ...formData
      });
    } else {
      createSupplier.mutate({
        user_id: user.id,
        ...formData
      });
    }
    
    handleCloseDialog();
  };

  const handleOpenDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplier.mutate(supplierToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setSupplierToDelete(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Suppliers</h1>
          <p className="text-white/70">Manage your Turkish suppliers</p>
        </div>
        <CustomButton 
          variant="primary" 
          size="sm" 
          className="mt-4 sm:mt-0" 
          onClick={() => handleOpenDialog()}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Supplier
        </CustomButton>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            type="text"
            placeholder="Search suppliers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-groop-blue"></div>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-10 text-center">
            <Truck className="h-12 w-12 text-white/30 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">No suppliers found</h3>
            <p className="text-white/70 mb-4">
              {searchTerm 
                ? "No suppliers match your search criteria" 
                : "You haven't added any suppliers yet"}
            </p>
            <CustomButton 
              variant="secondary" 
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Your First Supplier
            </CustomButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="glass">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleOpenDialog(supplier)} 
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteDialog(supplier)} 
                      className="text-white/70 hover:text-red-500 transition-colors"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <CardDescription>
                  Supplier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supplier.contact_person && (
                    <div className="flex items-start">
                      <User className="h-4 w-4 mt-1 mr-2 text-white/50" />
                      <span className="text-sm text-white/70">{supplier.contact_person}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-start">
                      <Mail className="h-4 w-4 mt-1 mr-2 text-white/50" />
                      <span className="text-sm text-white/70">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mt-1 mr-2 text-white/50" />
                      <span className="text-sm text-white/70">{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mt-1 mr-2 text-white/50" />
                      <span className="text-sm text-white/70">{supplier.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter supplier name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                placeholder="Enter contact person"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <CustomButton 
                type="button" 
                variant="outline" 
                onClick={handleCloseDialog}
              >
                Cancel
              </CustomButton>
              <CustomButton type="submit" variant="primary">
                {editingSupplier ? 'Update' : 'Add'} Supplier
              </CustomButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier
              {supplierToDelete?.name && <strong> "{supplierToDelete.name}"</strong>} and
              remove it from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Suppliers;
