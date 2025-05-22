import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FaStar, FaCar, FaGasPump, FaUserFriends, FaCog } from 'react-icons/fa';

interface CarDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: CarDetailPageProps): Promise<Metadata> {
  // Fetch car data
  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!car) {
    return {
      title: 'Car Not Found | Carbe',
    };
  }

  return {
    title: `${car.make} ${car.model} | Carbe`,
    description: car.description || `Rent the ${car.make} ${car.model} on Carbe`,
  };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  // Fetch car data
  const { data: car, error } = await supabase
    .from('cars')
    .select('*, profiles:owner_id(*)')
    .eq('id', params.id)
    .single();

  if (error || !car) {
    console.error('Error fetching car:', error);
    notFound();
  }

  // Get car owner (host) details
  const host = car.profiles;

  // Get car primary image or placeholder
  const primaryImage = car.images && car.images.length > 0
    ? car.images[0]
    : 'https://via.placeholder.com/800x400?text=No+Image';

  // Get additional images or empty array
  const additionalImages = car.images && car.images.length > 1
    ? car.images.slice(1)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-700">Home</Link>
          </li>
          <li className="flex items-center">
            <span className="mx-1">/</span>
            <Link href="/explore" className="hover:text-gray-700">Explore</Link>
          </li>
          <li className="flex items-center">
            <span className="mx-1">/</span>
            <span className="text-gray-900 font-medium">{car.make} {car.model}</span>
          </li>
        </ol>
      </nav>

      {/* Car title and basic info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{car.make} {car.model}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {car.location && (
            <div className="flex items-center">
              <span>{car.location}</span>
            </div>
          )}
          {car.rating && (
            <div className="flex items-center">
              <FaStar className="text-yellow-400 mr-1" />
              <span>{car.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Image gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 relative h-96 rounded-lg overflow-hidden">
          <Image 
            src={primaryImage} 
            alt={`${car.make} ${car.model}`} 
            fill 
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {additionalImages.slice(0, 4).map((image: string, index: number) => (
            <div key={index} className="relative h-44 rounded-lg overflow-hidden">
              <Image 
                src={image} 
                alt={`${car.make} ${car.model} - Image ${index + 2}`} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Car details and booking section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Car details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Car Details</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {car.transmission && (
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <FaCog className="text-indigo-600 mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">{car.transmission}</span>
                  <span className="text-xs text-gray-500">Transmission</span>
                </div>
              )}
              
              {car.fuel_type && (
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <FaGasPump className="text-indigo-600 mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">{car.fuel_type}</span>
                  <span className="text-xs text-gray-500">Fuel Type</span>
                </div>
              )}
              
              {car.seats && (
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <FaUserFriends className="text-indigo-600 mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">{car.seats} seats</span>
                  <span className="text-xs text-gray-500">Capacity</span>
                </div>
              )}
              
              {car.range_km && (
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <FaCar className="text-indigo-600 mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">{car.range_km} km</span>
                  <span className="text-xs text-gray-500">Range</span>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 mb-6">
              {car.description || `This ${car.make} ${car.model} is available for rent. Contact the host for more details.`}
            </p>
            
            <h3 className="text-lg font-semibold mb-2">Features</h3>
            <ul className="grid grid-cols-2 gap-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                Bluetooth connectivity
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                Air conditioning
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                USB charging
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                GPS navigation
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">About the Host</h2>
            <div className="flex items-center">
              <div className="h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mr-4">
                {host?.full_name ? host.full_name.charAt(0) : 'H'}
              </div>
              <div>
                <h3 className="font-medium text-lg">{host?.full_name || 'Carbe Host'}</h3>
                <p className="text-gray-500 text-sm">Host since {new Date(car.created_at).getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking section */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-2xl font-bold">${car.price_per_day}</span>
                <span className="text-gray-500"> / day</span>
              </div>
              {car.rating && (
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span>{car.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <p className="text-center text-gray-500">Select dates to check availability</p>
              {/* Date picker will go here */}
            </div>
            
            <Link 
              href={`/book/${car.id}`}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-center rounded-md font-medium transition-colors block"
            >
              Book now
            </Link>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              You won't be charged yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
