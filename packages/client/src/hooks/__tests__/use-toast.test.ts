import { renderHook, act, waitFor } from '@testing-library/react';
import { useToast, toast } from '../use-toast';

describe('useToast hook', () => {
  beforeEach(() => {
    // Clear any existing toasts before each test
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toasts.forEach((t) => {
        result.current.dismiss(t.id);
      });
    });
  });

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast when toast() is called', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({
        title: 'Test Toast',
        description: 'This is a test',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    expect(result.current.toasts[0].description).toBe('This is a test');
  });

  it('should limit toasts to TOAST_LIMIT (1)', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({ title: 'First Toast' });
      toast({ title: 'Second Toast' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Second Toast');
  });

  it('should dismiss a specific toast', async () => {
    const { result } = renderHook(() => useToast());
    let toastId: string;
    
    act(() => {
      const { id } = toast({ title: 'Test Toast' });
      toastId = id;
    });

    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.dismiss(toastId);
    });

    await waitFor(() => {
      expect(result.current.toasts[0].open).toBe(false);
    });
  });

  it('should dismiss all toasts when no id is provided', async () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({ title: 'First Toast' });
    });

    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.dismiss();
    });

    await waitFor(() => {
      expect(result.current.toasts[0].open).toBe(false);
    });
  });

  it('should update a toast', () => {
    const { result } = renderHook(() => useToast());
    let toastInstance: ReturnType<typeof toast>;
    
    act(() => {
      toastInstance = toast({ title: 'Original Title' });
    });

    expect(result.current.toasts[0].title).toBe('Original Title');
    
    act(() => {
      toastInstance.update({ title: 'Updated Title' });
    });

    expect(result.current.toasts[0].title).toBe('Updated Title');
  });

  it('should generate unique IDs for each toast', () => {
    act(() => {
      toast({ title: 'First' });
    });
    
    const { result: result1 } = renderHook(() => useToast());
    const firstId = result1.current.toasts[0]?.id;

    act(() => {
      toast({ title: 'Second' });
    });
    
    const { result: result2 } = renderHook(() => useToast());
    const secondId = result2.current.toasts[0]?.id;

    // IDs should be different
    expect(firstId).not.toBe(secondId);
  });

  it('should handle toast with action', () => {
    const { result } = renderHook(() => useToast());
    const mockAction = { altText: 'Undo' } as any;
    
    act(() => {
      toast({
        title: 'Test Toast',
        action: mockAction,
      });
    });

    expect(result.current.toasts[0].action).toBe(mockAction);
  });

  it('should set open to true by default', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      toast({ title: 'Test Toast' });
    });

    expect(result.current.toasts[0].open).toBe(true);
  });
});
