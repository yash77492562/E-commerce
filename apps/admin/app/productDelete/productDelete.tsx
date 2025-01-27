import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@repo/ui/alert-dialog';
import { Button } from '@repo/ui/button';
import { toast } from 'sonner';

type ProductDeleteProps = {
  productId: string;
  onDelete?: () => void;
};

export function ProductDeleteButton({ 
  productId, 
  onDelete 
}: ProductDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/productDelete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('Product Deleted', {
          description: 'The product has been permanently removed.',
          duration: 3000,
          icon: <Trash2 className="text-green-500" />,
        });
        
        setResultMessage({ type: 'success', message: result.message || 'Product deleted successfully.' });
        onDelete?.();
        window.location.reload();
      } else {
        switch (result.errorType) {
          case 'ORDER_RELATIONSHIP':
            setResultMessage({
              type: 'error',
              message: 'This product is associated with recent orders in processing or delivery.',
            });
            break;
          default:
            setResultMessage({
              type: 'error',
              message: result.message || 'An unexpected error occurred.',
            });
        }
      }
    } catch (error) {
      console.error('Delete product error:', error);
      setResultMessage({
        type: 'error',
        message: 'Unable to connect to the server. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Auto-remove message after 1 second
  useEffect(() => {
    if (resultMessage) {
      const timer = setTimeout(() => {
        setResultMessage(null);
      }, 5000);

      return () => clearTimeout(timer); // Cleanup
    }
  }, [resultMessage]);

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 z-10 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className=''>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className='text-white'>       
              <span className='block p-1'>Are you sure you want to permanently delete this product? </span>
              <span className='block p-1'>This action cannot be undone and will remove:-</span> 
              <span className='block p-1 pl-4'>Product details</span>
              <span className='block p-1 pl-4'>All associated images</span>
              <span className='block p-1 pl-4'>Related cart and order entries</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel >
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {resultMessage && (
        <div
          className={`fixed bottom-4 left-4 p-4 rounded-md shadow-lg border fadeIn ${
            resultMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          } flex items-center space-x-2 `}
        >
          {resultMessage.type === 'success' ? (
            <CheckCircle className="h-5 w-5 z-50 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 z-50 text-red-500" />
          )}
          <span>{resultMessage.message}</span>
        </div>
      )}
    </>
  );
}