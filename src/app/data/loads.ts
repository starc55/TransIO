export interface Load {
  id: string;
  origin: {
    city: string;
    state: string;
    address: string;
  };
  destination: {
    city: string;
    state: string;
    address: string;
  };
  distance: number;
  rate: number;
  pickupDate: string;
  pickupTime: string;
  trailerType: "Dry Van" | "Reefer" | "Flatbed";
  weight: number;
  dimensions: string;
  broker: string;
  contact: {
    phone: string;
    email: string;
  };
  notes: string;
  tags: string[];
  status: "Available" | "Booked" | "Expired";
}

export const mockLoads: Load[] = [
  {
    id: "L001",
    origin: {
      city: "Los Angeles",
      state: "CA",
      address: "2100 E Maple Ave, El Segundo, CA 90245"
    },
    destination: {
      city: "Phoenix",
      state: "AZ",
      address: "4545 W Glendale Ave, Phoenix, AZ 85301"
    },
    distance: 373,
    rate: 1250,
    pickupDate: "2026-04-08",
    pickupTime: "08:00 AM",
    trailerType: "Dry Van",
    weight: 42000,
    dimensions: "48' x 8.5' x 9'",
    broker: "Swift Logistics",
    contact: {
      phone: "(555) 123-4567",
      email: "dispatch@swiftlog.com"
    },
    notes: "Fragile electronics. Handle with care. Driver must have 2+ years experience.",
    tags: ["Hot Load", "Urgent"],
    status: "Available"
  },
  {
    id: "L002",
    origin: {
      city: "Chicago",
      state: "IL",
      address: "1200 W 35th St, Chicago, IL 60609"
    },
    destination: {
      city: "Dallas",
      state: "TX",
      address: "3500 Sylvan Ave, Dallas, TX 75212"
    },
    distance: 967,
    rate: 2800,
    pickupDate: "2026-04-09",
    pickupTime: "06:00 AM",
    trailerType: "Reefer",
    weight: 38000,
    dimensions: "53' x 8.5' x 9'",
    broker: "FreightMax Pro",
    contact: {
      phone: "(555) 234-5678",
      email: "ops@freightmax.com"
    },
    notes: "Temperature-controlled load. Must maintain 34-38°F throughout transit.",
    tags: ["High Pay"],
    status: "Available"
  },
  {
    id: "L003",
    origin: {
      city: "Atlanta",
      state: "GA",
      address: "5600 Oakbrook Pkwy, Norcross, GA 30093"
    },
    destination: {
      city: "Miami",
      state: "FL",
      address: "7800 NW 25th St, Miami, FL 33122"
    },
    distance: 662,
    rate: 1890,
    pickupDate: "2026-04-07",
    pickupTime: "02:00 PM",
    trailerType: "Dry Van",
    weight: 28000,
    dimensions: "48' x 8.5' x 9'",
    broker: "Elite Transport",
    contact: {
      phone: "(555) 345-6789",
      email: "load@elitetrans.com"
    },
    notes: "General freight. Standard delivery timeline.",
    tags: [],
    status: "Available"
  },
  {
    id: "L004",
    origin: {
      city: "Seattle",
      state: "WA",
      address: "3900 1st Ave S, Seattle, WA 98134"
    },
    destination: {
      city: "Portland",
      state: "OR",
      address: "7000 NE Airport Way, Portland, OR 97218"
    },
    distance: 173,
    rate: 650,
    pickupDate: "2026-04-08",
    pickupTime: "10:00 AM",
    trailerType: "Flatbed",
    weight: 35000,
    dimensions: "48' x 8.5'",
    broker: "Pacific Freight Lines",
    contact: {
      phone: "(555) 456-7890",
      email: "bookings@pacificfreight.com"
    },
    notes: "Construction materials. Tarps required. Secure load properly.",
    tags: ["Quick Trip"],
    status: "Available"
  },
  {
    id: "L005",
    origin: {
      city: "Denver",
      state: "CO",
      address: "6500 Tower Rd, Denver, CO 80249"
    },
    destination: {
      city: "Salt Lake City",
      state: "UT",
      address: "5600 W Amelia Earhart Dr, Salt Lake City, UT 84116"
    },
    distance: 525,
    rate: 1600,
    pickupDate: "2026-04-10",
    pickupTime: "07:00 AM",
    trailerType: "Dry Van",
    weight: 44000,
    dimensions: "53' x 8.5' x 9'",
    broker: "Mountain Express",
    contact: {
      phone: "(555) 567-8901",
      email: "support@mountainexp.com"
    },
    notes: "Standard freight. Full truckload. Easy loading dock access.",
    tags: [],
    status: "Available"
  },
  {
    id: "L006",
    origin: {
      city: "Houston",
      state: "TX",
      address: "8300 N Sam Houston Pkwy E, Houston, TX 77044"
    },
    destination: {
      city: "New Orleans",
      state: "LA",
      address: "2200 Veterans Blvd, New Orleans, LA 70062"
    },
    distance: 348,
    rate: 1150,
    pickupDate: "2026-04-11",
    pickupTime: "12:00 PM",
    trailerType: "Reefer",
    weight: 36000,
    dimensions: "48' x 8.5' x 9'",
    broker: "Gulf Coast Freight",
    contact: {
      phone: "(555) 678-9012",
      email: "dispatch@gulfcoast.com"
    },
    notes: "Perishable goods. Temperature must be maintained at 35°F.",
    tags: ["Hot Load"],
    status: "Available"
  },
  {
    id: "L007",
    origin: {
      city: "Boston",
      state: "MA",
      address: "25 Dorchester Ave, Boston, MA 02205"
    },
    destination: {
      city: "New York",
      state: "NY",
      address: "Building 75, JFK Airport, Jamaica, NY 11430"
    },
    distance: 215,
    rate: 850,
    pickupDate: "2026-04-07",
    pickupTime: "05:00 AM",
    trailerType: "Dry Van",
    weight: 25000,
    dimensions: "40' x 8.5' x 9'",
    broker: "Northeast Carriers",
    contact: {
      phone: "(555) 789-0123",
      email: "loads@northeast.com"
    },
    notes: "Expedited delivery. Must arrive by 6 PM same day.",
    tags: ["Urgent", "Quick Trip"],
    status: "Available"
  },
  {
    id: "L008",
    origin: {
      city: "Nashville",
      state: "TN",
      address: "540 Mainstream Dr, Nashville, TN 37228"
    },
    destination: {
      city: "Memphis",
      state: "TN",
      address: "3250 Democrat Rd, Memphis, TN 38118"
    },
    distance: 212,
    rate: 720,
    pickupDate: "2026-04-09",
    pickupTime: "09:00 AM",
    trailerType: "Flatbed",
    weight: 40000,
    dimensions: "48' x 8.5'",
    broker: "Southern Transport Co",
    contact: {
      phone: "(555) 890-1234",
      email: "booking@southerntrans.com"
    },
    notes: "Heavy machinery. Chains and binders required. Oversize permit in place.",
    tags: [],
    status: "Available"
  },
  {
    id: "L009",
    origin: {
      city: "Indianapolis",
      state: "IN",
      address: "7855 Rockville Rd, Indianapolis, IN 46214"
    },
    destination: {
      city: "Columbus",
      state: "OH",
      address: "4300 W Broad St, Columbus, OH 43228"
    },
    distance: 175,
    rate: 580,
    pickupDate: "2026-04-10",
    pickupTime: "11:00 AM",
    trailerType: "Dry Van",
    weight: 32000,
    dimensions: "48' x 8.5' x 9'",
    broker: "Midwest Logistics",
    contact: {
      phone: "(555) 901-2345",
      email: "dispatch@midwestlog.com"
    },
    notes: "Retail goods. Easy access warehouse. Multiple drops available.",
    tags: ["Quick Trip"],
    status: "Available"
  },
  {
    id: "L010",
    origin: {
      city: "San Francisco",
      state: "CA",
      address: "1333 Bryant St, San Francisco, CA 94103"
    },
    destination: {
      city: "Las Vegas",
      state: "NV",
      address: "6185 S Valley View Blvd, Las Vegas, NV 89118"
    },
    distance: 570,
    rate: 1920,
    pickupDate: "2026-04-08",
    pickupTime: "04:00 PM",
    trailerType: "Reefer",
    weight: 41000,
    dimensions: "53' x 8.5' x 9'",
    broker: "Coast Express",
    contact: {
      phone: "(555) 012-3456",
      email: "loads@coastexpress.com"
    },
    notes: "Temperature-sensitive pharmaceuticals. Maintain 2-8°C. White glove service required.",
    tags: ["Hot Load", "High Pay"],
    status: "Available"
  },
  {
    id: "L011",
    origin: {
      city: "Detroit",
      state: "MI",
      address: "1500 E 8 Mile Rd, Detroit, MI 48234"
    },
    destination: {
      city: "Pittsburgh",
      state: "PA",
      address: "1000 Reedsdale St, Pittsburgh, PA 15233"
    },
    distance: 288,
    rate: 950,
    pickupDate: "2026-04-11",
    pickupTime: "07:00 AM",
    trailerType: "Dry Van",
    weight: 39000,
    dimensions: "53' x 8.5' x 9'",
    broker: "Great Lakes Freight",
    contact: {
      phone: "(555) 123-4568",
      email: "greatlakes@freight.com"
    },
    notes: "Auto parts. Time-sensitive delivery. Factory direct.",
    tags: ["Urgent"],
    status: "Available"
  },
  {
    id: "L012",
    origin: {
      city: "Charlotte",
      state: "NC",
      address: "5901 Statesville Rd, Charlotte, NC 28269"
    },
    destination: {
      city: "Raleigh",
      state: "NC",
      address: "4600 Emperor Blvd, Durham, NC 27703"
    },
    distance: 145,
    rate: 485,
    pickupDate: "2026-04-07",
    pickupTime: "01:00 PM",
    trailerType: "Flatbed",
    weight: 29000,
    dimensions: "40' x 8.5'",
    broker: "Carolina Carriers",
    contact: {
      phone: "(555) 234-5679",
      email: "carolina@carriers.com"
    },
    notes: "Building materials. Tarps provided. Short haul.",
    tags: ["Quick Trip"],
    status: "Available"
  }
];