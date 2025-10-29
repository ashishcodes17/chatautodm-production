import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { QuoteIcon } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export function Testimonials() {
  const testimonials = [
    {
      quote:
        "ChatAutoDM has completely transformed how I deliver lead magnets. My engagement rate has increased by 45% since I started using it.",
      name: "Sandhyatechy",
      title: "Tech Creator",
      avatar: "/sandhyatechy.jpg",
      initials: "ST",
      rating: 5,
    },
    {
      quote:
        "Setting up automated DMs used to take hours of manual work. Now I can create new automations in minutes and focus on creating content.",
      name: "Ajays Vision",
      title: "Content Creator",
      avatar: "/ajaysvision.jpg",
      initials: "AJ",
      rating: 4.5,
    },
    {
      quote:
        "The analytics dashboard gives me incredible insights into which posts and keywords drive the most engagement. Game changer!",
      name: "Design Horizons",
      title: "Digital Creator",
      avatar: "/designhorizon.jpg",
      initials: "DC",
      rating: 4.8,
    },
    {
      quote:
        "As an e-commerce brand, we've seen a 32% increase in conversions from Instagram since implementing InstaAutoDM for our product launches.",
      name: "Designer Rajesh",
      title: "Editing Agency",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DR",
      rating: 5,
    },
    {
      quote:
        "The customer support team is incredible. They helped me set up complex automations for my coaching business that now run on autopilot.",
      name: "Venky Tech",
      title: "Tech Creator",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "VT",
      rating: 5,
    },
    {
      quote:
        "I was skeptical at first, but after seeing a 78% open rate on my automated DMs, I'm completely sold on this platform.",
      name: "Alex Parker",
      title: "Fitness Influencer",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AP",
      rating: 5,
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-small-white/[0.2] -z-10" />
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl -z-10" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-purple-200/30 bg-purple-50/50 px-3 py-1 text-sm text-purple-600 backdrop-blur-md dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300">
              <span className="mr-2 rounded-full bg-purple-600 h-2 w-2"></span>
              Success Stories
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Loved by Creators and Businesses
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              See what our customers are saying about how InstaAutoDM has transformed their Instagram engagement
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-4">
                  <div className="p-1">
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        <QuoteIcon className="h-8 w-8 text-pink-500/20 mb-4" />
                        <p className="mb-6 text-muted-foreground flex-grow">{testimonial.quote}</p>

                        {/* Star rating */}
                        <div className="flex mb-4">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8 gap-2">
              <CarouselPrevious className="relative inset-0 translate-y-0 bg-background border border-input hover:bg-accent hover:text-accent-foreground" />
              <CarouselNext className="relative inset-0 translate-y-0 bg-background border border-input hover:bg-accent hover:text-accent-foreground" />
            </div>
          </Carousel>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "1,000+", label: "Active Users" },
            { value: "1.2L+", label: "DMs Sent" },
            { value: "85%", label: "Avg. Open Rate" },
            { value: "4.75/5", label: "Customer Rating" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
