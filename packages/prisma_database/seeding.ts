// apps/web/prisma/seed.ts
import {prisma} from './src/prisma'

async function main() {
  // Check if contact data already exists
  const existingContact = await prisma.contact.findFirst()
  
  if (!existingContact) {
    await prisma.contact.create({
      data: {
        address_main: "1-5 Needham Road",
        address_city: "London, W11 2RP",
        email: "info@flowgallery.co.uk",
        phone_main: "+44 20 7243 0782",
        phone_second: "+44 20 7792 1505",
        sunday: "Closed",
        monday: "Closed",
        tuesday: "Closed",
        wednesday: "11 am–6 pm",
        thursday: "11 am–6 pm",
        friday: "11 am–6 pm",
        saturday: "11 am–6 pm"
      }
    })
    console.log('✨ Contact data seeded successfully')
  } else {
    console.log('📝 Contact data already exists - skipping seed')
  }
  const existingHomeInfo = await prisma.homeInfo.findFirst()
  
  if (!existingHomeInfo) {
    await prisma.homeInfo.create({
      data: {
        heading:"Exquisite International and British Craft",
        para:"Flow Gallery is an intimate gallery situated in Notting Hill, London, carefully curating a personal collection for the cherished interior. We work in close contact with craftspeople knowing the provenance of each object."
      }
    })
    console.log('✨ Home Info data seeded successfully')
  } else {
    console.log('📝 Home Info data already exists - skipping seed')
  }

  const existingHomeMain = await prisma.homeMain.findFirst()
  
  if (!existingHomeMain) {
    await prisma.homeMain.create({
      data: {
        heading:"Making Memories",
        first_para:"Flow's 25th Anniversary",
        second_para:"Group Exhibition",
        third_para:"15th November 2024 - 15th January 2025"
      }
    })
    console.log('✨ Home Main data seeded successfully')
  } else {
    console.log('📝 Home Main data already exists - skipping seed')
  }
  const existingFooter = await prisma.footer.findFirst()
  
  if (!existingFooter) {
    await prisma.footer.create({
      data: {
        companyName:"© Flow Gallery 2024",
        address:"1-5 Needham Road, London, W11 2RP",
        phone:"+44 20 7243 0782",
        open:"Wednesday – Saturday, 11 am – 6 pm",
        close:"Sunday – Tuesday",
        email:"info@flowgallery.co.uk"
      }
    })
    console.log('✨ Home Main data seeded successfully')
  } else {
    console.log('📝 Home Main data already exists - skipping seed')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })