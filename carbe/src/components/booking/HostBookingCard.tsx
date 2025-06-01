import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Car, 
  Clock, 
  MessageSquare,
  CheckCircle,
  User,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Euro,
  Timer
} from 'lucide-react';
import { BookingWithCar, BookingStatus } from '@/types/booking';
import { useBooking } from '@/hooks/booking/useBooking';
import { toast } from 'react-hot-toast';

interface HostBookingCardProps {
  booking: BookingWithCar;
  onStatusChange?: () => void;
  compact?: boolean;
}

export default function HostBookingCard({ booking, onStatusChange, compact = false }: HostBookingCardProps) {
  const router = useRouter();
  const { approveBooking, isApproving } = useBooking();
  const [showDetails, setShowDetails] = useState(false);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);

  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Confirmed',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          dotColor: 'bg-green-400'
        };
      case 'pending':
      case 'awaiting_approval':
        return {
          icon: <Timer className="h-4 w-4" />,
          text: 'Awaiting Your Approval',
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          dotColor: 'bg-amber-400'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Completed',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          dotColor: 'bg-blue-400'
        };
      case 'cancelled':
      case 'rejected':
        return {
          icon: <X className="h-4 w-4" />,
          text: status === 'rejected' ? 'Declined' : 'Cancelled',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          dotColor: 'bg-red-400'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Processing',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          dotColor: 'bg-gray-400'
        };
    }
  };

  const calculateDuration = () => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    return differenceInDays(end, start) + 1;
  };

  const handleApproval = async (action: 'approve' | 'reject') => {
    setProcessingAction(action);
    try {
      const success = await approveBooking({
        booking_id: booking.id,
        action,
      });

      if (success) {
        toast.success(action === 'approve' ? 'Booking approved successfully!' : 'Booking declined');
        onStatusChange?.();
      }
    } catch (error) {
      console.error('Error handling approval:', error);
      toast.error('Failed to process booking');
    } finally {
      setProcessingAction(null);
    }
  };

  const statusConfig = getStatusConfig(booking.status);

  if (compact) {
    return (
      <div 
        className="bg-gradient-to-br from-[#2A2A2A] to-[#242424] border border-gray-700/40 rounded-2xl p-5 hover:border-gray-600/60 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 cursor-pointer group"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {booking.cars.images && booking.cars.images.length > 0 ? (
                <Image
                  src={booking.cars.images[0]}
                  alt={`${booking.cars.make} ${booking.cars.model}`}
                  width={64}
                  height={48}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Car className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm group-hover:text-gray-100 transition-colors">
                {booking.cars.make} {booking.cars.model}
              </h4>
              <p className="text-sm text-gray-400">
                {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end mb-1 space-x-2">
              <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor}`}>
                {statusConfig.text}
              </span>
            </div>
            <div className="text-sm font-bold text-white">€{booking.total_amount}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#2A2A2A] to-[#242424] border border-gray-700/40 rounded-3xl overflow-hidden hover:border-gray-600/60 hover:shadow-xl hover:shadow-black/20 transition-all duration-500 group">
      {/* Status Header */}
      <div className="bg-gradient-to-r from-[#1F1F1F] to-[#1A1A1A] border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
              <div className={`absolute inset-0 w-2 h-2 rounded-full ${statusConfig.dotColor} animate-ping opacity-30`} />
            </div>
            <span className={`text-sm font-medium ${statusConfig.color}`}>
              {statusConfig.text}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">€{booking.total_amount}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {(booking.status === 'pending' || booking.status === 'awaiting_approval') ? 'Potential' : 'Earnings'}
            </div>
          </div>
        </div>
      </div>

             {/* Main Content - Cleaner */}
       <div className="p-5">
         {/* Simple Car & Trip Info */}
         <div className="flex items-center space-x-4 mb-5">
           {/* Clean Car Image */}
           <div className="w-20 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden flex-shrink-0">
             {booking.cars.images && booking.cars.images.length > 0 ? (
               <Image
                 src={booking.cars.images[0]}
                 alt={`${booking.cars.make} ${booking.cars.model}`}
                 width={80}
                 height={56}
                 className="w-full h-full object-cover"
               />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                 <Car className="h-6 w-6 text-gray-400" />
               </div>
             )}
           </div>

           {/* Car Info */}
           <div className="flex-1">
             <h3 className="text-lg font-bold text-white leading-tight mb-1">
               {booking.cars.make} {booking.cars.model}
             </h3>
             <div className="flex items-center text-sm text-gray-400">
               <Calendar className="h-3 w-3 mr-1.5" />
               <span>
                 {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
               </span>
               <span className="mx-1.5">•</span>
               <span>{calculateDuration()} day{calculateDuration() > 1 ? 's' : ''}</span>
             </div>
           </div>
         </div>

         {/* Clean Guest Info */}
         <div className="flex items-center justify-between p-3 bg-gray-800/20 rounded-xl mb-5">
           <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
               <User className="h-4 w-4 text-gray-400" />
             </div>
             <div>
               <div className="font-medium text-white text-sm">
                 {booking.snapshot_first_name} {booking.snapshot_last_name}
               </div>
               <div className="text-xs text-gray-400">Guest</div>
             </div>
           </div>
           
           <div className="flex items-center space-x-2">
             <button 
               className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
               onClick={(e) => {
                 e.stopPropagation();
                 router.push(`/chat/${booking.id}`);
               }}
             >
               <MessageSquare className="h-4 w-4" />
             </button>
             
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowDetails(!showDetails);
               }}
               className="flex items-center px-2 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
             >
               <span className="text-sm mr-1">Details</span>
               {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
             </button>
           </div>
         </div>

                 {/* PROMINENT ACCEPT/DECLINE BUTTONS */}
         {(booking.status === 'pending' || booking.status === 'awaiting_approval') && (
           <div className="space-y-4 mb-5">
             {/* Action Required Message */}
             <div className="text-center p-3 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl">
               <span className="text-sm font-medium text-amber-400">
                 Please respond within 24 hours
               </span>
             </div>

             {/* BIG ACTION BUTTONS */}
             <div className="grid grid-cols-2 gap-3">
               <button
                 onClick={() => handleApproval('reject')}
                 disabled={isApproving || processingAction !== null}
                 className="flex items-center justify-center py-3 px-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 font-medium"
               >
                 {processingAction === 'reject' ? (
                   <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 ) : (
                   <>
                     <X className="h-4 w-4 mr-2" />
                     Decline
                   </>
                 )}
               </button>
               
               <button
                 onClick={() => handleApproval('approve')}
                 disabled={isApproving || processingAction !== null}
                 className="flex items-center justify-center py-3 px-4 bg-gradient-to-r from-[#FF2800] to-[#FF4646] text-white rounded-xl hover:from-[#FF2800]/90 hover:to-[#FF4646]/90 transition-all duration-300 disabled:opacity-50 font-medium shadow-lg"
               >
                 {processingAction === 'approve' ? (
                   <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 ) : (
                   <>
                     <Check className="h-4 w-4 mr-2" />
                     Accept
                   </>
                 )}
               </button>
             </div>
           </div>
         )}

                 {/* Clean Confirmed Status */}
         {booking.status === 'confirmed' && (
           <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl mb-5">
             <div className="flex items-center justify-between">
               <div className="flex items-center text-sm text-green-400">
                 <CheckCircle className="h-4 w-4 mr-2" />
                 <span className="font-medium">Booking Confirmed</span>
               </div>
               <div className="flex items-center space-x-1">
                 <Euro className="h-3 w-3 text-green-400" />
                 <span className="text-green-400 font-bold text-sm">€{booking.total_amount}</span>
               </div>
             </div>
           </div>
         )}

         {/* Clean Expandable Details */}
         {showDetails && (
           <div className="pt-4 border-t border-gray-700/30 space-y-3">
             <div className="grid grid-cols-2 gap-3">
               <div className="bg-gray-800/30 p-3 rounded-lg">
                 <span className="text-gray-400 text-xs uppercase tracking-wide">Daily Rate</span>
                 <div className="text-white font-bold">€{booking.daily_rate}</div>
               </div>
               <div className="bg-gray-800/30 p-3 rounded-lg">
                 <span className="text-gray-400 text-xs uppercase tracking-wide">Service Fee</span>
                 <div className="text-white font-bold">€{booking.service_fee}</div>
               </div>
             </div>
             
             {booking.special_requests && (
               <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-3 rounded-lg">
                 <span className="text-blue-400 text-xs uppercase tracking-wide mb-1 block font-medium">Special Requests</span>
                 <p className="text-blue-100 text-sm">{booking.special_requests}</p>
               </div>
             )}
           </div>
         )}
      </div>
    </div>
  );
} 