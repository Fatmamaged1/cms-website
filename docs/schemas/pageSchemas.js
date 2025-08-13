/**
 * @swagger
 * components:
 *   schemas:
 *     HomePage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the page
 *         pageType:
 *           type: string
 *           enum: [home]
 *           description: Type of the page (always 'home' for home page)
 *         title:
 *           type: string
 *           description: Page title
 *         seo:
 *           $ref: '#/components/schemas/SeoMetadata'
 *         sections:
 *           $ref: '#/components/schemas/HomePageSections'
 *         language:
 *           type: string
 *           enum: [en, ar]
 *           description: Language code
 *         isActive:
 *           type: boolean
 *           description: Whether the page is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     HomePageSections:
 *       type: object
 *       properties:
 *         hero:
 *           $ref: '#/components/schemas/HeroSection'
 *         about:
 *           $ref: '#/components/schemas/AboutSection'
 *         services:
 *           $ref: '#/components/schemas/ServicesSection'
 *         features:
 *           $ref: '#/components/schemas/FeaturesSection'
 *         testimonials:
 *           $ref: '#/components/schemas/TestimonialsSection'
 *         blog:
 *           $ref: '#/components/schemas/BlogSection'
 *         contact:
 *           $ref: '#/components/schemas/ContactSection'
 *         cta:
 *           $ref: '#/components/schemas/CtaSection'
 * 
 *     HeroSection:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         subtitle:
 *           type: string
 *         description:
 *           type: string
 *         backgroundImage:
 *           type: string
 *           format: uri
 *         primaryButton:
 *           $ref: '#/components/schemas/Button'
 *         secondaryButton:
 *           $ref: '#/components/schemas/Button'
 * 
 *     AboutSection:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         image:
 *           type: string
 *           format: uri
 *         features:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FeatureItem'
 * 
 *     ServicesSection:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         subtitle:
 *           type: string
 *         backgroundImage:
 *           type: string
 *           format: uri
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ServiceItem'
 * 
 *     FeaturesSection:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FeatureItem'
 * 
 *     TestimonialsSection:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TestimonialItem'
 * 
 *     BlogSection:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         subtitle:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogPostItem'
 * 
 *     ContactSection:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         subtitle:
 *           type: string
 *         address:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         mapEmbedUrl:
 *           type: string
 *           format: uri
 *         formEnabled:
 *           type: boolean
 * 
 *     CtaSection:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         subtitle:
 *           type: string
 *         button:
 *           $ref: '#/components/schemas/Button'
 *         backgroundImage:
 *           type: string
 *           format: uri
 * 
 *     Button:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *         url:
 *           type: string
 * 
 *     FeatureItem:
 *       type: object
 *       properties:
 *         icon:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 * 
 *     ServiceItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         excerpt:
 *           type: string
 *         icon:
 *           type: string
 *         thumbnail:
 *           type: string
 *           format: uri
 *         featuredImage:
 *           type: string
 *           format: uri
 *         price:
 *           type: number
 * 
 *     TestimonialItem:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *         author:
 *           type: string
 *         position:
 *           type: string
 *         avatar:
 *           type: string
 *           format: uri
 * 
 *     BlogPostItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         excerpt:
 *           type: string
 *         featuredImage:
 *           type: string
 *           format: uri
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         author:
 *           type: string
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         readingTime:
 *           type: string
 * 
 *     SeoMetadata:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         metaDescription:
 *           type: string
 *         metaKeywords:
 *           type: string
 *         canonicalUrl:
 *           type: string
 *           format: uri
 *         ogTitle:
 *           type: string
 *         ogDescription:
 *           type: string
 *         ogImage:
 *           type: string
 *           format: uri
 *         twitterCard:
 *           type: string
 */

// Export the schemas for use in Swagger configuration
module.exports = {};
