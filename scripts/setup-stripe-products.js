const Stripe = require("stripe")
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function setupStripeProducts() {
  try {
    console.log("Setting up Stripe products and prices...")

    // Create products
    const basicProduct = await stripe.products.create({
      name: "CreditAI Pro - Basic",
      description: "Perfect for getting started with credit repair",
      metadata: {
        plan: "basic",
      },
    })

    const professionalProduct = await stripe.products.create({
      name: "CreditAI Pro - Professional",
      description: "Most popular plan for serious credit repair",
      metadata: {
        plan: "professional",
      },
    })

    const premiumProduct = await stripe.products.create({
      name: "CreditAI Pro - Premium",
      description: "Complete credit repair solution with expert support",
      metadata: {
        plan: "premium",
      },
    })

    // Create prices
    const basicPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 3900, // $39.00
      currency: "usd",
      recurring: {
        interval: "month",
      },
      nickname: "Basic Monthly",
    })

    const professionalPrice = await stripe.prices.create({
      product: professionalProduct.id,
      unit_amount: 7900, // $79.00
      currency: "usd",
      recurring: {
        interval: "month",
      },
      nickname: "Professional Monthly",
    })

    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 12900, // $129.00
      currency: "usd",
      recurring: {
        interval: "month",
      },
      nickname: "Premium Monthly",
    })

    console.log("Products and prices created successfully!")
    console.log("Update your code with these Price IDs:")
    console.log(`Basic Price ID: ${basicPrice.id}`)
    console.log(`Professional Price ID: ${professionalPrice.id}`)
    console.log(`Premium Price ID: ${premiumPrice.id}`)
  } catch (error) {
    console.error("Error setting up Stripe products:", error)
  }
}

setupStripeProducts()
