import { db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";

const dummyPhotographers = [
    {
        id: "demo_photog_1",
        name: "Aarav Sharma",
        email: "aarav.demo@example.com",
        city: "Mumbai",
        phone: "+91 9876543210",
        bio: "Professional wedding and portrait photographer with 10 years of experience in capturing cinematic moments.",
        categories: ["Wedding", "Engagement", "Fashion & Editorial"],
        rating: 4.8,
        portfolio: [
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1583939000240-690b22dc5f25?auto=format&fit=crop&q=80&w=800"
        ],
        packages: [
            { name: "Basic", description: "2 hours of coverage, 50 edited photos", price: "15000" },
            { name: "Standard", description: "Half day coverage, 200 edited photos", price: "35000" },
            { name: "Premium", description: "Full day coverage, 500+ edited photos, drone shots", price: "75000" }
        ],
        role: "photographer"
    },
    {
        id: "demo_photog_2",
        name: "Priya Desai",
        email: "priya.demo@example.com",
        city: "Delhi",
        phone: "+91 9876543211",
        bio: "Specializing in corporate headshots, real estate, and event photography.",
        categories: ["Corporate", "Real Estate", "Event"],
        rating: 4.5,
        portfolio: [
            "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"
        ],
        packages: [
            { name: "Basic", description: "1-hour headshot session, 5 edits", price: "5000" },
            { name: "Standard", description: "Property shoot (up to 3 BHK)", price: "12000" }
        ],
        role: "photographer"
    },
    {
        id: "demo_photog_3",
        name: "Rohan Kapoor",
        email: "rohan.demo@example.com",
        city: "Bangalore",
        phone: "+91 9876543212",
        bio: "Creative product and food photographer helping brands stand out.",
        categories: ["Product", "Food & Beverage"],
        rating: 4.9,
        portfolio: [
            "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
        ],
        packages: [
            { name: "Basic", description: "10 product shots on white background", price: "8000" },
            { name: "Premium", description: "Stylized lifestyle product shoot", price: "25000" }
        ],
        role: "photographer"
    },
    {
        id: "demo_photog_4",
        name: "Ananya Singh",
        email: "ananya.demo@example.com",
        city: "Pune",
        phone: "+91 9876543213",
        bio: "Capturing the pure joy of maternity, baby showers, birthdays, and pet photography.",
        categories: ["Maternity", "Baby Shower", "Pet Photography", "Birthday"],
        rating: 4.7,
        portfolio: [
            "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1555243896-771a81232c49?auto=format&fit=crop&q=80&w=800"
        ],
        packages: [
            { name: "Basic", description: "1 hour outdoor shoot", price: "6000" },
            { name: "Premium", description: "2 hours indoor + outdoor shoot with props", price: "15000" }
        ],
        role: "photographer"
    },
    {
        id: "demo_photog_5",
        name: "Vikram Reddy",
        email: "vikram.demo@example.com",
        city: "Hyderabad",
        phone: "+91 9876543214",
        bio: "Action, sports, and car shoot specialist. High energy, high speed.",
        categories: ["Sports & Action", "Car Shoot", "Concerts & Nightlife"],
        rating: 4.6,
        portfolio: [
            "https://images.unsplash.com/photo-1511516104764-5550cebe0642?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&q=80&w=800"
        ],
        packages: [
            { name: "Basic", description: "Coverage of one local match/event", price: "10000" },
            { name: "Premium", description: "Full weekend coverage with drone", price: "40000" }
        ],
        role: "photographer"
    }
];

export const seedDatabase = async () => {
    try {
        console.log("Seeding database with dummy photographers...");
        let count = 0;
        for (const photog of dummyPhotographers) {
            const { id, ...data } = photog;
            await setDoc(doc(db, "photographers", id), {
                ...data,
                createdAt: new Date().toISOString()
            });
            count++;
        }
        alert(`Successfully seeded ${count} dummy photographers! Refresh the page to see them.`);
    } catch (error) {
        console.error("Error seeding database:", error);
        alert("Error seeding database: " + error.message);
    }
};
