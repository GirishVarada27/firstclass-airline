import { pool } from '../db.js'
import { auth } from '../auth.js'
import { getMigrations } from 'better-auth/db/migration'

const AIRPORTS = [
  { city: 'New York', code: 'JFK', country: 'USA' },
  { city: 'Los Angeles', code: 'LAX', country: 'USA' },
  { city: 'Chicago', code: 'ORD', country: 'USA' },
  { city: 'Miami', code: 'MIA', country: 'USA' },
  { city: 'San Francisco', code: 'SFO', country: 'USA' },
  { city: 'Toronto', code: 'YYZ', country: 'Canada' },
  { city: 'London', code: 'LHR', country: 'UK' },
  { city: 'Paris', code: 'CDG', country: 'France' },
  { city: 'Amsterdam', code: 'AMS', country: 'Netherlands' },
  { city: 'Frankfurt', code: 'FRA', country: 'Germany' },
  { city: 'Rome', code: 'FCO', country: 'Italy' },
  { city: 'Madrid', code: 'MAD', country: 'Spain' },
  { city: 'Zurich', code: 'ZRH', country: 'Switzerland' },
  { city: 'Istanbul', code: 'IST', country: 'Turkey' },
  { city: 'Dubai', code: 'DXB', country: 'UAE' },
  { city: 'Doha', code: 'DOH', country: 'Qatar' },
  { city: 'Mumbai', code: 'BOM', country: 'India' },
  { city: 'Delhi', code: 'DEL', country: 'India' },
  { city: 'Singapore', code: 'SIN', country: 'Singapore' },
  { city: 'Bangkok', code: 'BKK', country: 'Thailand' },
  { city: 'Hong Kong', code: 'HKG', country: 'Hong Kong' },
  { city: 'Tokyo', code: 'HND', country: 'Japan' },
  { city: 'Seoul', code: 'ICN', country: 'South Korea' },
  { city: 'Sydney', code: 'SYD', country: 'Australia' },
  { city: 'Bengaluru', code: 'BLR', country: 'India' },
  { city: 'Hyderabad', code: 'HYD', country: 'India' },
  { city: 'Pune', code: 'PNQ', country: 'India' },
  { city: 'Kolkata', code: 'CCU', country: 'India' },
  { city: 'Chennai', code: 'MAA', country: 'India' },
  { city: 'Lucknow', code: 'LKO', country: 'India' },
  { city: 'Ahmedabad', code: 'AMD', country: 'India' },
  { city: 'Goa', code: 'GOI', country: 'India' },
  { city: 'Kochi', code: 'COK', country: 'India' },
  { city: 'Lisbon', code: 'LIS', country: 'Portugal' },
  { city: 'Dublin', code: 'DUB', country: 'Ireland' },
  { city: 'Stockholm', code: 'ARN', country: 'Sweden' },
  { city: 'Oslo', code: 'OSL', country: 'Norway' },
  { city: 'Copenhagen', code: 'CPH', country: 'Denmark' },
  { city: 'Warsaw', code: 'WAW', country: 'Poland' },
  { city: 'Brussels', code: 'BRU', country: 'Belgium' },
  { city: 'Helsinki', code: 'HEL', country: 'Finland' },
  { city: 'Dubrovnik', code: 'DBV', country: 'Croatia' },
  { city: 'Reykjavik', code: 'KEF', country: 'Iceland' },
  { city: 'Melbourne', code: 'MEL', country: 'Australia' },
  { city: 'Brisbane', code: 'BNE', country: 'Australia' },
  { city: 'Perth', code: 'PER', country: 'Australia' },
  { city: 'Auckland', code: 'AKL', country: 'New Zealand' },
  { city: 'Wellington', code: 'WLG', country: 'New Zealand' },
  { city: 'Christchurch', code: 'CHC', country: 'New Zealand' },
  { city: 'Abu Dhabi', code: 'AUH', country: 'UAE' },
  { city: 'Muscat', code: 'MCT', country: 'Oman' },
  { city: 'Kuwait City', code: 'KWI', country: 'Kuwait' },
  { city: 'Riyadh', code: 'RUH', country: 'Saudi Arabia' },
  { city: 'Manama', code: 'BAH', country: 'Bahrain' },
]

// [originIdx, destIdx, cabinClass, price, dayOffset, departTime, arriveTime, duration]
const ROUTE_PLAN = [
  [0, 6, 'Economy', 620, 3, '19:30', '07:45+1', '7h 15m'],
  [0, 6, 'Business', 2400, 3, '19:30', '07:45+1', '7h 15m'],
  [0, 6, 'First Class', 5200, 5, '21:00', '09:15+1', '7h 15m'],
  [6, 0, 'Economy', 640, 4, '11:20', '14:10', '8h 50m'],
  [0, 7, 'Economy', 590, 2, '18:45', '07:55+1', '7h 10m'],
  [0, 7, 'First Class', 4900, 6, '20:10', '09:20+1', '7h 10m'],
  [1, 21, 'Economy', 980, 5, '01:10', '05:40+1', '11h 30m'],
  [1, 21, 'First Class', 6800, 5, '01:10', '05:40+1', '11h 30m'],
  [2, 14, 'Economy', 870, 4, '22:40', '20:15+1', '13h 35m'],
  [6, 14, 'Economy', 410, 2, '14:05', '00:35+1', '7h 30m'],
  [6, 14, 'Business', 1650, 2, '14:05', '00:35+1', '7h 30m'],
  [14, 18, 'Economy', 320, 3, '02:15', '13:40', '8h 25m'],
  [14, 21, 'First Class', 3900, 7, '03:30', '17:00', '8h 30m'],
  [7, 8, 'Economy', 130, 1, '08:15', '09:35', '1h 20m'],
  [7, 10, 'Economy', 210, 2, '10:05', '12:40', '2h 35m'],
  [7, 11, 'Economy', 195, 3, '13:20', '15:50', '2h 30m'],
  [8, 12, 'Economy', 175, 2, '09:40', '11:15', '1h 35m'],
  [9, 13, 'Economy', 260, 4, '16:00', '19:50', '3h 50m'],
  [13, 14, 'Economy', 240, 2, '06:30', '11:45', '4h 15m'],
  [15, 16, 'Economy', 355, 3, '23:10', '04:20+1', '4h 10m'],
  [16, 17, 'Economy', 95, 1, '07:00', '09:10', '1h 10m'],
  [18, 19, 'Economy', 140, 2, '11:30', '12:55', '1h 25m'],
  [19, 20, 'Economy', 165, 3, '15:45', '19:30', '2h 45m'],
  [20, 21, 'Economy', 310, 5, '08:20', '20:05', '4h 45m'],
  [21, 22, 'Economy', 285, 4, '10:10', '17:30', '2h 20m'],
  [22, 23, 'Economy', 520, 6, '00:45', '11:20', '9h 35m'],
  [23, 1, 'Economy', 890, 8, '18:00', '11:30+1', '13h 30m'],
  [4, 18, 'Economy', 940, 6, '20:30', '19:45+1', '17h 15m'],
  [5, 6, 'Economy', 480, 3, '20:00', '07:30+1', '6h 30m'],
  [3, 7, 'Economy', 610, 4, '21:15', '10:40+1', '8h 25m'],

  // Indian domestic routes (Bengaluru, Hyderabad, Pune, Kolkata, Chennai, Lucknow, Ahmedabad, Goa, Kochi)
  [16, 24, 'Economy', 95, 1, '06:00', '07:45', '1h 45m'],
  [24, 17, 'Economy', 110, 2, '09:00', '11:35', '2h 35m'],
  [17, 25, 'Economy', 105, 1, '14:00', '16:10', '2h 10m'],
  [25, 16, 'Economy', 90, 3, '08:30', '10:05', '1h 35m'],
  [16, 26, 'Economy', 60, 1, '07:15', '08:20', '1h 05m'],
  [17, 27, 'Economy', 115, 2, '12:00', '14:20', '2h 20m'],
  [27, 28, 'Economy', 120, 3, '16:30', '19:00', '2h 30m'],
  [28, 24, 'Economy', 70, 1, '09:45', '11:00', '1h 15m'],
  [17, 29, 'Economy', 85, 2, '18:00', '19:25', '1h 25m'],
  [16, 30, 'Economy', 75, 1, '10:00', '11:15', '1h 15m'],
  [16, 31, 'Economy', 65, 3, '13:00', '14:20', '1h 20m'],
  [32, 16, 'Economy', 100, 2, '06:45', '08:35', '1h 50m'],
  [24, 32, 'Economy', 80, 4, '11:00', '12:15', '1h 15m'],

  // Indian international routes
  [24, 14, 'Economy', 340, 4, '01:30', '03:30', '4h 00m'],
  [24, 18, 'Economy', 380, 5, '23:00', '06:30+1', '4h 30m'],
  [25, 15, 'Economy', 360, 4, '02:15', '04:20', '4h 05m'],
  [28, 18, 'Economy', 350, 6, '22:30', '05:45+1', '4h 15m'],
  [32, 14, 'Economy', 320, 3, '03:00', '05:00', '3h 30m'],
  [30, 14, 'Economy', 330, 5, '04:00', '06:05', '3h 35m'],
  [27, 19, 'Economy', 290, 4, '09:00', '13:15', '4h 15m'],
  [25, 6, 'Business', 2200, 7, '02:00', '11:00', '9h 00m'],
  [26, 14, 'Economy', 310, 6, '05:00', '07:00', '3h 30m'],
  [29, 14, 'Economy', 300, 8, '23:30', '01:45+1', '3h 45m'],

  // European routes (Portugal, Ireland, Sweden, Norway, Denmark, Poland, Belgium, Finland, Croatia, Iceland)
  [33, 7, 'Economy', 180, 2, '08:00', '10:30', '2h 30m'],
  [34, 6, 'Economy', 120, 1, '07:30', '08:50', '1h 20m'],
  [35, 9, 'Economy', 160, 3, '09:15', '11:00', '1h 45m'],
  [36, 8, 'Economy', 150, 2, '10:00', '11:45', '1h 45m'],
  [37, 6, 'Economy', 140, 1, '06:45', '08:00', '1h 15m'],
  [38, 9, 'Economy', 130, 4, '13:00', '14:35', '1h 35m'],
  [39, 7, 'Economy', 95, 1, '11:00', '12:15', '1h 15m'],
  [40, 35, 'Economy', 85, 2, '08:00', '09:15', '1h 15m'],
  [41, 10, 'Economy', 110, 3, '12:30', '13:45', '1h 15m'],
  [42, 6, 'Economy', 290, 5, '09:00', '12:15', '3h 15m'],
  [33, 14, 'Economy', 560, 5, '22:00', '07:30+1', '7h 30m'],
  [34, 16, 'Economy', 620, 6, '21:00', '10:30+1', '9h 30m'],
  [35, 14, 'Business', 3100, 4, '20:30', '05:15+1', '6h 45m'],
  [38, 17, 'Economy', 580, 7, '23:15', '10:45+1', '8h 30m'],
  [39, 14, 'Economy', 540, 3, '19:45', '05:00+1', '6h 15m'],
  [36, 15, 'Economy', 600, 6, '21:15', '06:30+1', '7h 15m'],
  [37, 14, 'Economy', 570, 4, '20:00', '05:30+1', '7h 30m'],
  [40, 14, 'Economy', 590, 5, '22:45', '08:15+1', '7h 30m'],

  // Australia / New Zealand <-> India & Gulf
  [43, 16, 'Economy', 780, 3, '23:00', '10:30+1', '10h 30m'],
  [44, 17, 'Economy', 760, 4, '22:15', '09:45+1', '10h 30m'],
  [45, 24, 'Economy', 520, 2, '08:00', '15:30', '5h 30m'],
  [23, 25, 'Economy', 740, 5, '21:30', '08:00+1', '9h 30m'],
  [46, 28, 'Economy', 820, 6, '20:00', '09:15+1', '11h 15m'],
  [43, 14, 'Economy', 900, 3, '23:45', '06:30+1', '13h 45m'],
  [23, 49, 'Economy', 870, 4, '22:30', '05:15+1', '13h 45m'],
  [46, 15, 'Economy', 950, 5, '21:00', '04:45+1', '14h 45m'],
  [47, 14, 'Economy', 890, 7, '20:15', '03:00+1', '13h 45m'],
  [48, 50, 'Economy', 860, 6, '19:30', '02:15+1', '13h 45m'],
]

function futureDate(daysFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

function buildFlights() {
  return ROUTE_PLAN.map(([oIdx, dIdx, cabin, price, dayOffset, depTime, arrTime, duration], i) => {
    const origin = AIRPORTS[oIdx]
    const destination = AIRPORTS[dIdx]
    return {
      flightNumber: `FC${100 + i}`,
      airline: 'FirstClass Airways',
      originCity: origin.city,
      originCode: origin.code,
      originCountry: origin.country,
      destinationCity: destination.city,
      destinationCode: destination.code,
      destinationCountry: destination.country,
      departureDate: futureDate(dayOffset),
      departureTime: depTime,
      arrivalTime: arrTime,
      duration,
      cabinClass: cabin,
      price,
      international: origin.country !== destination.country,
      seatsAvailable: cabin === 'First Class' ? 8 : cabin === 'Business' ? 20 : 140,
    }
  })
}

const HOTEL_CITIES = [
  ['New York', 'USA'], ['Los Angeles', 'USA'], ['Chicago', 'USA'], ['Miami', 'USA'], ['San Francisco', 'USA'],
  ['Las Vegas', 'USA'], ['Toronto', 'Canada'], ['Vancouver', 'Canada'], ['Mexico City', 'Mexico'],
  ['Rio de Janeiro', 'Brazil'], ['Buenos Aires', 'Argentina'], ['London', 'UK'], ['Edinburgh', 'UK'],
  ['Paris', 'France'], ['Nice', 'France'], ['Amsterdam', 'Netherlands'], ['Berlin', 'Germany'],
  ['Frankfurt', 'Germany'], ['Rome', 'Italy'], ['Venice', 'Italy'], ['Milan', 'Italy'], ['Barcelona', 'Spain'],
  ['Madrid', 'Spain'], ['Lisbon', 'Portugal'], ['Zurich', 'Switzerland'], ['Geneva', 'Switzerland'],
  ['Vienna', 'Austria'], ['Prague', 'Czech Republic'], ['Athens', 'Greece'], ['Istanbul', 'Turkey'],
  ['Dubai', 'UAE'], ['Abu Dhabi', 'UAE'], ['Doha', 'Qatar'], ['Cairo', 'Egypt'], ['Marrakech', 'Morocco'],
  ['Cape Town', 'South Africa'], ['Nairobi', 'Kenya'], ['Mumbai', 'India'], ['Delhi', 'India'],
  ['Singapore', 'Singapore'], ['Bangkok', 'Thailand'], ['Hong Kong', 'Hong Kong'], ['Tokyo', 'Japan'],
  ['Kyoto', 'Japan'], ['Seoul', 'South Korea'], ['Shanghai', 'China'], ['Beijing', 'China'],
  ['Kuala Lumpur', 'Malaysia'], ['Sydney', 'Australia'], ['Auckland', 'New Zealand'],

  // 100 more hotel destinations, excluding the USA
  ['Montreal', 'Canada'], ['Quebec City', 'Canada'], ['Calgary', 'Canada'], ['Ottawa', 'Canada'],
  ['Cancun', 'Mexico'], ['Punta Cana', 'Dominican Republic'], ['Havana', 'Cuba'], ['Nassau', 'Bahamas'], ['Montego Bay', 'Jamaica'],
  ['Sao Paulo', 'Brazil'], ['Santiago', 'Chile'], ['Lima', 'Peru'], ['Bogota', 'Colombia'], ['Cartagena', 'Colombia'], ['Quito', 'Ecuador'], ['Montevideo', 'Uruguay'],
  ['Manchester', 'UK'], ['Glasgow', 'UK'], ['Dublin', 'Ireland'], ['Belfast', 'UK'],
  ['Lyon', 'France'], ['Marseille', 'France'], ['Bordeaux', 'France'],
  ['Munich', 'Germany'], ['Hamburg', 'Germany'], ['Cologne', 'Germany'],
  ['Florence', 'Italy'], ['Naples', 'Italy'], ['Turin', 'Italy'],
  ['Seville', 'Spain'], ['Valencia', 'Spain'], ['Ibiza', 'Spain'],
  ['Porto', 'Portugal'], ['Lucerne', 'Switzerland'], ['Salzburg', 'Austria'], ['Rotterdam', 'Netherlands'], ['Brussels', 'Belgium'],
  ['Stockholm', 'Sweden'], ['Oslo', 'Norway'], ['Copenhagen', 'Denmark'], ['Helsinki', 'Finland'], ['Reykjavik', 'Iceland'],
  ['Warsaw', 'Poland'], ['Krakow', 'Poland'], ['Budapest', 'Hungary'], ['Bucharest', 'Romania'], ['Zagreb', 'Croatia'],
  ['Dubrovnik', 'Croatia'], ['Ljubljana', 'Slovenia'], ['Sofia', 'Bulgaria'], ['Belgrade', 'Serbia'],
  ['Riga', 'Latvia'], ['Tallinn', 'Estonia'],
  ['Antalya', 'Turkey'],
  ['Amman', 'Jordan'], ['Muscat', 'Oman'], ['Beirut', 'Lebanon'], ['Tel Aviv', 'Israel'],
  ['Riyadh', 'Saudi Arabia'], ['Jeddah', 'Saudi Arabia'], ['Manama', 'Bahrain'], ['Kuwait City', 'Kuwait'],
  ['Casablanca', 'Morocco'], ['Tunis', 'Tunisia'], ['Zanzibar', 'Tanzania'], ['Victoria Falls', 'Zimbabwe'],
  ['Accra', 'Ghana'], ['Lagos', 'Nigeria'], ['Addis Ababa', 'Ethiopia'], ['Port Louis', 'Mauritius'], ['Victoria', 'Seychelles'],
  ['Kathmandu', 'Nepal'], ['Colombo', 'Sri Lanka'], ['Male', 'Maldives'], ['Dhaka', 'Bangladesh'],
  ['Jaipur', 'India'], ['Udaipur', 'India'],
  ['Denpasar', 'Indonesia'], ['Jakarta', 'Indonesia'], ['Manila', 'Philippines'], ['Cebu', 'Philippines'],
  ['Hanoi', 'Vietnam'], ['Ho Chi Minh City', 'Vietnam'], ['Siem Reap', 'Cambodia'], ['Phnom Penh', 'Cambodia'],
  ['Yangon', 'Myanmar'],
  ['Osaka', 'Japan'], ['Taipei', 'Taiwan'], ['Busan', 'South Korea'], ['Chengdu', 'China'], ['Xi’an', 'China'], ['Guangzhou', 'China'], ['Macau', 'China'],
  ['Melbourne', 'Australia'], ['Brisbane', 'Australia'], ['Perth', 'Australia'], ['Gold Coast', 'Australia'],
  ['Queenstown', 'New Zealand'], ['Wellington', 'New Zealand'], ['Nadi', 'Fiji'],
]

const HOTEL_NAME_PREFIXES = ['Grand', 'Royal', 'The Metropolitan', 'Skyline', 'Azure', 'The Regency', 'Nova', 'The Continental', 'Lumen', 'The Meridian']

function buildHotels() {
  return HOTEL_CITIES.map(([city, country], i) => {
    const star = 3 + (i % 3)
    return {
      name: `${HOTEL_NAME_PREFIXES[i % HOTEL_NAME_PREFIXES.length]} ${city}`,
      city,
      country,
      starRating: star,
      pricePerNight: 90 + star * 55 + (i % 7) * 20,
      roomsAvailable: 12 + (i % 5) * 4,
      image: `https://picsum.photos/seed/hotel-${encodeURIComponent(city.replace(/\s+/g, '-'))}/600/400`,
      description: `A ${star}-star stay in the heart of ${city}, ${country} — FirstClass-vetted comfort with skyline views and 24-hour concierge.`,
    }
  })
}

const TOURS = [
  ['Paris', 'France', 'Eiffel Tower & Louvre Highlights', 4],
  ['Rome', 'Italy', 'Colosseum & Ancient Rome Walk', 3.5],
  ['London', 'UK', 'Royal London Heritage Tour', 4],
  ['Tokyo', 'Japan', 'Shibuya, Shrines & Street Food', 5],
  ['New York', 'USA', 'Manhattan Skyline & Central Park', 3],
  ['Dubai', 'UAE', 'Desert Safari & Burj Khalifa', 6],
  ['Istanbul', 'Turkey', 'Grand Bazaar & Hagia Sophia', 4],
  ['Bangkok', 'Thailand', 'Temples & Floating Markets', 5],
  ['Cairo', 'Egypt', 'Pyramids of Giza & Sphinx', 4.5],
  ['Barcelona', 'Spain', 'Gaudi Architecture Trail', 3.5],
  ['Athens', 'Greece', 'Acropolis & Ancient Agora', 3.5],
  ['Kyoto', 'Japan', 'Bamboo Grove & Golden Pavilion', 4],
  ['Marrakech', 'Morocco', 'Medina Souks & Palace Tour', 4],
  ['Rio de Janeiro', 'Brazil', 'Christ the Redeemer & Sugarloaf', 5],
  ['Sydney', 'Australia', 'Opera House & Harbour Bridge Climb', 4],
  ['Amsterdam', 'Netherlands', 'Canal Cruise & Van Gogh Museum', 3],
  ['Prague', 'Czech Republic', 'Old Town & Prague Castle', 3.5],
  ['Venice', 'Italy', 'Gondola Ride & St. Mark’s Square', 3],
  ['Cusco', 'Peru', 'Machu Picchu Day Expedition', 8],
  ['Amman', 'Jordan', 'Petra: The Rose City', 7],

  // 50 more guided tour destinations
  ['Melbourne', 'Australia', 'Great Ocean Road Day Trip', 9],
  ['Queenstown', 'New Zealand', 'Milford Sound Fiordland Adventure', 10],
  ['Denpasar', 'Indonesia', 'Ubud Temples & Rice Terraces', 6],
  ['Hanoi', 'Vietnam', 'Halong Bay Cruise Day Tour', 8],
  ['Ho Chi Minh City', 'Vietnam', 'Mekong Delta Discovery', 6],
  ['Siem Reap', 'Cambodia', 'Angkor Wat Sunrise Tour', 5],
  ['Kathmandu', 'Nepal', 'Himalayan Foothills Trek', 8],
  ['Colombo', 'Sri Lanka', 'Galle Fort & Coastal Heritage', 5],
  ['Male', 'Maldives', 'Island Hopping & Snorkeling', 4],
  ['Jaipur', 'India', 'Amber Fort & Pink City Tour', 5],
  ['Udaipur', 'India', 'Lake Palaces of Udaipur', 4],
  ['Goa', 'India', 'Beaches & Spice Plantations', 5],
  ['Beirut', 'Lebanon', 'Baalbek Ancient Ruins Tour', 6],
  ['Tel Aviv', 'Israel', 'Jerusalem Old City Day Trip', 8],
  ['Muscat', 'Oman', 'Wahiba Sands Desert Safari', 7],
  ['Riyadh', 'Saudi Arabia', 'Diriyah Heritage Tour', 4],
  ['Jeddah', 'Saudi Arabia', 'Al-Balad Old Town Walk', 3],
  ['Casablanca', 'Morocco', 'Hassan II Mosque & Medina', 4],
  ['Tunis', 'Tunisia', 'Carthage Ruins Tour', 4],
  ['Zanzibar', 'Tanzania', 'Stone Town & Spice Tour', 5],
  ['Victoria Falls', 'Zimbabwe', 'Waterfall & Safari Adventure', 6],
  ['Accra', 'Ghana', 'Cape Coast Castle Heritage Tour', 6],
  ['Addis Ababa', 'Ethiopia', 'Lalibela Rock Churches Expedition', 9],
  ['Victoria', 'Seychelles', 'Beaches of Praslin Island', 5],
  ['Port Louis', 'Mauritius', 'Chamarel & Black River Gorges', 6],
  ['Lyon', 'France', 'Old Lyon & Culinary Walk', 3.5],
  ['Marseille', 'France', 'Calanques Coastal Boat Tour', 4],
  ['Munich', 'Germany', 'Neuschwanstein Castle Day Trip', 9],
  ['Hamburg', 'Germany', 'Speicherstadt Harbor Tour', 3],
  ['Florence', 'Italy', 'Uffizi & Renaissance Art Trail', 4],
  ['Naples', 'Italy', 'Pompeii Ruins Excursion', 6],
  ['Seville', 'Spain', 'Alcazar & Flamenco Experience', 4],
  ['Porto', 'Portugal', 'Douro Valley Wine Tour', 8],
  ['Budapest', 'Hungary', 'Danube River Cruise & Castle', 3.5],
  ['Zagreb', 'Croatia', 'Plitvice Lakes National Park', 9],
  ['Dubrovnik', 'Croatia', 'Old Town Walls & Game of Thrones Tour', 3],
  ['Ljubljana', 'Slovenia', 'Lake Bled Day Trip', 7],
  ['Sofia', 'Bulgaria', 'Rila Monastery Tour', 8],
  ['Krakow', 'Poland', 'Auschwitz-Birkenau Memorial Tour', 7],
  ['Stockholm', 'Sweden', 'Gamla Stan Old Town Walk', 3],
  ['Copenhagen', 'Denmark', 'Tivoli & Nyhavn Harbor Tour', 3],
  ['Reykjavik', 'Iceland', 'Golden Circle Northern Lights Tour', 9],
  ['Edinburgh', 'UK', 'Edinburgh Castle & Royal Mile', 3.5],
  ['Dublin', 'Ireland', 'Cliffs of Moher Day Trip', 10],
  ['Cape Town', 'South Africa', 'Table Mountain & Cape Point Tour', 8],
  ['Nairobi', 'Kenya', 'Maasai Mara Safari Experience', 10],
  ['Fes', 'Morocco', 'Fes Medina & Tannery Tour', 4],
  ['Buenos Aires', 'Argentina', 'Tango Show & La Boca Walk', 4],
  ['Santiago', 'Chile', 'Valparaiso Coastal Day Trip', 8],
  ['Bogota', 'Colombia', 'Monserrate & La Candelaria Walk', 5],
]

function buildTours() {
  return TOURS.map(([city, country, title, hours], i) => ({
    city,
    country,
    title,
    durationHours: hours,
    pricePerPerson: 45 + Math.round(hours * 18) + (i % 4) * 10,
    spotsAvailable: 15 + (i % 6) * 5,
    image: `https://picsum.photos/seed/tour-${encodeURIComponent(city.replace(/\s+/g, '-'))}/600/400`,
    description: `A guided small-group experience through ${title.toLowerCase()} in ${city}, ${country}, led by a local FirstClass tour expert.`,
  }))
}

async function createSchema(client) {
  await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto')

  await client.query(`
    CREATE TABLE IF NOT EXISTS flights (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      flight_number TEXT NOT NULL,
      airline TEXT NOT NULL,
      origin_city TEXT NOT NULL,
      origin_code TEXT NOT NULL,
      origin_country TEXT NOT NULL,
      destination_city TEXT NOT NULL,
      destination_code TEXT NOT NULL,
      destination_country TEXT NOT NULL,
      departure_date DATE NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      duration TEXT NOT NULL,
      cabin_class TEXT NOT NULL DEFAULT 'Economy',
      price NUMERIC NOT NULL,
      international BOOLEAN NOT NULL DEFAULT false,
      seats_available INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (flight_number, departure_date)
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      star_rating INTEGER NOT NULL,
      price_per_night NUMERIC NOT NULL,
      rooms_available INTEGER NOT NULL,
      image TEXT,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (name, city)
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS tours (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration_hours NUMERIC NOT NULL,
      price_per_person NUMERIC NOT NULL,
      spots_available INTEGER NOT NULL,
      image TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (title, city)
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS flight_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      flight_id UUID NOT NULL REFERENCES flights(id),
      user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT,
      passengers INTEGER NOT NULL,
      total_price NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS hotel_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      hotel_id UUID NOT NULL REFERENCES hotels(id),
      user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      rooms INTEGER NOT NULL,
      total_price NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS tour_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tour_id UUID NOT NULL REFERENCES tours(id),
      user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT,
      tour_date DATE NOT NULL,
      participants INTEGER NOT NULL,
      total_price NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await client.query(`CREATE SEQUENCE IF NOT EXISTS order_number_seq START 100000`)

  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number TEXT NOT NULL UNIQUE,
      reference_number TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      category TEXT NOT NULL CHECK (category IN ('flight', 'hotel', 'tour')),
      flight_booking_id UUID REFERENCES flight_bookings(id),
      hotel_booking_id UUID REFERENCES hotel_bookings(id),
      tour_booking_id UUID REFERENCES tour_bookings(id),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      details JSONB NOT NULL,
      total_amount NUMERIC NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'paid',
      payment_method TEXT NOT NULL DEFAULT 'card',
      card_last4 TEXT NOT NULL,
      card_holder TEXT NOT NULL,
      order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      CHECK (
        (category = 'flight' AND flight_booking_id IS NOT NULL AND hotel_booking_id IS NULL AND tour_booking_id IS NULL) OR
        (category = 'hotel' AND hotel_booking_id IS NOT NULL AND flight_booking_id IS NULL AND tour_booking_id IS NULL) OR
        (category = 'tour' AND tour_booking_id IS NOT NULL AND flight_booking_id IS NULL AND hotel_booking_id IS NULL)
      )
    )
  `)
}

async function seedFlights(client) {
  for (const f of buildFlights()) {
    await client.query(
      `INSERT INTO flights (
         flight_number, airline, origin_city, origin_code, origin_country,
         destination_city, destination_code, destination_country,
         departure_date, departure_time, arrival_time, duration,
         cabin_class, price, international, seats_available
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (flight_number, departure_date) DO UPDATE SET
         airline = EXCLUDED.airline,
         origin_city = EXCLUDED.origin_city,
         origin_code = EXCLUDED.origin_code,
         origin_country = EXCLUDED.origin_country,
         destination_city = EXCLUDED.destination_city,
         destination_code = EXCLUDED.destination_code,
         destination_country = EXCLUDED.destination_country,
         departure_time = EXCLUDED.departure_time,
         arrival_time = EXCLUDED.arrival_time,
         duration = EXCLUDED.duration,
         cabin_class = EXCLUDED.cabin_class,
         price = EXCLUDED.price,
         international = EXCLUDED.international`,
      [f.flightNumber, f.airline, f.originCity, f.originCode, f.originCountry,
       f.destinationCity, f.destinationCode, f.destinationCountry,
       f.departureDate, f.departureTime, f.arrivalTime, f.duration,
       f.cabinClass, f.price, f.international, f.seatsAvailable]
    )
  }
}

async function seedHotels(client) {
  for (const h of buildHotels()) {
    await client.query(
      `INSERT INTO hotels (name, city, country, star_rating, price_per_night, rooms_available, image, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (name, city) DO UPDATE SET
         country = EXCLUDED.country,
         star_rating = EXCLUDED.star_rating,
         price_per_night = EXCLUDED.price_per_night,
         image = EXCLUDED.image,
         description = EXCLUDED.description`,
      [h.name, h.city, h.country, h.starRating, h.pricePerNight, h.roomsAvailable, h.image, h.description]
    )
  }
}

async function seedTours(client) {
  for (const t of buildTours()) {
    await client.query(
      `INSERT INTO tours (city, country, title, description, duration_hours, price_per_person, spots_available, image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (title, city) DO UPDATE SET
         country = EXCLUDED.country,
         description = EXCLUDED.description,
         duration_hours = EXCLUDED.duration_hours,
         price_per_person = EXCLUDED.price_per_person,
         image = EXCLUDED.image`,
      [t.city, t.country, t.title, t.description, t.durationHours, t.pricePerPerson, t.spotsAvailable, t.image]
    )
  }
}

export async function initDb() {
  const { runMigrations } = await getMigrations(auth.options)
  await runMigrations()

  const client = await pool.connect()
  try {
    await createSchema(client)
    await seedFlights(client)
    await seedHotels(client)
    await seedTours(client)
  } finally {
    client.release()
  }
}
