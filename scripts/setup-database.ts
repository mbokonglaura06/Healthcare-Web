// Database setup and seeding script for development
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyA86g8sv8thLeE5WUq2FZ_pQfUKG82eebE",
  authDomain: "health-appointment-ff687.firebaseapp.com",
  projectId: "health-appointment-ff687",
  storageBucket: "health-appointment-ff687.firebasestorage.app",
  messagingSenderId: "367515170037",
  appId: "1:367515170037:web:38663940aae2e785fb81bc",
  measurementId: "G-SMY766QNG6"

}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface SeedData {
  users: any[]
  appointments: any[]
  specialties: string[]
}

const seedData: SeedData = {
  users: [
    {
      uid: "admin-1",
      email: "admin@healthconnect.com",
      role: "admin",
      firstName: "System",
      lastName: "Administrator",
      isApproved: true,
      createdAt: new Date(),
    },
    {
      uid: "doctor-1",
      email: "dr.smith@healthconnect.com",
      role: "doctor",
      firstName: "John",
      lastName: "Smith",
      specialty: "Cardiology",
      isApproved: true,
      createdAt: new Date(),
    },
    {
      uid: "patient-1",
      email: "patient@example.com",
      role: "patient",
      firstName: "Jane",
      lastName: "Doe",
      isApproved: true,
      createdAt: new Date(),
    },
  ],
  appointments: [
    {
      patientId: "patient-1",
      doctorId: "doctor-1",
      patientName: "Jane Doe",
      doctorName: "John Smith",
      doctorSpecialty: "Cardiology",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: "10:00",
      duration: 30,
      type: "teleconsultation",
      status: "scheduled",
      reason: "Regular checkup",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  specialties: [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
  ],
}

async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Seed users
    for (const user of seedData.users) {
      await setDoc(doc(db, "users", user.uid), user)
      console.log(`Created user: ${user.email}`)
    }

    // Seed appointments
    for (const appointment of seedData.appointments) {
      await addDoc(collection(db, "appointments"), appointment)
      console.log(`Created appointment: ${appointment.patientName} with ${appointment.doctorName}`)
    }

    // Seed specialties
    for (const specialty of seedData.specialties) {
      await addDoc(collection(db, "specialties"), {
        name: specialty,
        createdAt: new Date(),
      })
      console.log(`Created specialty: ${specialty}`)
    }

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase()
}

export { seedDatabase }
