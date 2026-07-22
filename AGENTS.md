# Philosophy: YAGNI

Build only what's specified below. Do not:


Add abstraction layers, factories, or generic "framework" code for a single use case
Add config options, feature flags, or env toggles nobody asked for
Build for scale you don't have (no Redis cache, no microservices, no message queues)
Add the Edge Feature (image-based ingredient scanner) or anything from Future Vision (mobile app, AI meal plans, wearables, social features) — explicitly out of scope
Install a package for something 10 lines of plain code can do
Create a file "for later" — only create a file when a current task needs it


If a task can be done with fewer files, fewer dependencies, or fewer lines, do that.

# Stack

Frontend: React (Vite), Tailwind CSS, React Router, Recharts, Axios
Backend: Node.js, Express, JWT, bcryptjs, dotenv
DB: MongoDB Atlas + Mongoose
- **External:** USDA FoodData Central API, Nodemailer (email), Twilio (SMS/OTP)

# FILE TREE

whatyoueat/
├── client/                              # React frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                         # one file per resource, all axios calls live here
│   │   │   ├── axiosInstance.js         # base config + interceptors (JWT attach, refresh)
│   │   │   ├── authApi.js
│   │   │   ├── passwordApi.js           # forgotPasswordEmail, forgotPasswordPhone, verifyOtp, resetPassword
│   │   │   ├── foodApi.js
│   │   │   ├── mealApi.js
│   │   │   ├── recipeApi.js
│   │   │   ├── userApi.js
│   │   │   └── exportApi.js
│   │   ├── assets/                      # images, icons
│   │   ├── components/
│   │   │   ├── common/                  # Button, Modal, Loader, Input, Badge
│   │   │   ├── layout/                  # Navbar, Sidebar, Footer, ProtectedRoute
│   │   │   ├── auth/                    # LoginForm, SignupForm,
│   │   │   │                           # ForgotPasswordForm, OtpVerificationForm, ResetPasswordForm
│   │   │   ├── dashboard/               # CalorieProgressBar, MacroDonutChart, WeeklyLineChart, StreakCounter
│   │   │   ├── food/                    # FoodSearchBar, FoodResultCard, HealthLabelBadge
│   │   │   ├── meals/                   # MealLogForm, MealList, MealItem, PortionSelector
│   │   │   ├── health/                  # WaterTracker, BMICalculator, TDEECalculator
│   │   │   └── recipe/                  # RecipeUrlInput, IngredientBreakdownList
│   │   ├── context/                     # AuthContext.jsx, GoalContext.jsx
│   │   ├── hooks/                       # useAuth.js, useDebounce.js, useFetch.js
│   │   ├── pages/                       # DashboardPage, LoginPage, SignupPage,
│   │   │                               # ForgotPasswordPage, OtpVerificationPage, ResetPasswordPage,
│   │   │                               # MealLogPage, RecipeAnalyzerPage, ProfilePage
│   │   ├── routes/                      # AppRoutes.jsx
│   │   ├── utils/                       # dateHelpers.js, bmiFormulas.js, constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                             # VITE_API_URL etc.
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                              # Node/Express backend
│   ├── config/
│   │   └── db.js                        # mongoose connect
│   ├── models/
│   │   ├── User.js                      # profile: height, weight, activityLevel, goals,
│   │   │                               # phone, phoneVerified, resetPasswordToken, resetPasswordExpires,
│   │   │                               # otp, otpExpires
│   │   ├── Meal.js                      # type: breakfast/lunch/dinner/snack, foodItems[], date
│   │   ├── CustomFood.js
│   │   ├── WaterLog.js
│   │   └── DailyGoal.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── passwordController.js        # forgotPasswordEmail, forgotPasswordPhone, verifyOtp, resetPassword
│   │   ├── userController.js
│   │   ├── foodController.js            # search + fetch nutrition
│   │   ├── mealController.js            # CRUD meal logs
│   │   ├── recipeController.js          # URL/text -> nutrition breakdown
│   │   ├── waterController.js
│   │   └── exportController.js          # weekly PDF summary
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── passwordRoutes.js            # /forgot-password/email, /forgot-password/phone, /verify-otp, /reset-password
│   │   ├── userRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── mealRoutes.js
│   │   ├── recipeRoutes.js
│   │   ├── waterRoutes.js
│   │   └── exportRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT verify + protect
│   │   ├── errorHandler.js              # centralized error handling
│   │   └── validateRequest.js           # request schema validation
│   ├── services/                        # external API wrappers, kept separate from controllers
│   │   ├── edamamFoodService.js
│   │   ├── edamamRecipeService.js
│   │   ├── emailService.js              # nodemailer wrapper — sends reset link/OTP
│   │   └── smsService.js                # Twilio wrapper — sends OTP via SMS
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── generateResetToken.js        # crypto token for email reset link
│   │   ├── generateOtp.js               # random 6-digit OTP generator
│   │   ├── calculateBMI.js
│   │   ├── calculateTDEE.js
│   │   └── pdfGenerator.js
│   ├── validators/                      # joi/zod schemas per resource
│   │   └── passwordValidators.js        # validate email/phone format, OTP format, new password strength
│   ├── .env                             # MONGO_URI, JWT_SECRET, EDAMAM_APP_ID/KEY,
│   │                                    # EMAIL_HOST/PORT/USER/PASS, TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE_NUMBER
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md

Do not create files or folders outside this tree unless a phase below explicitly requires it. If you think a new file is needed, check YAGNI first — can it live in an existing file instead?

# Rules

No premature generalization. One Edamam key type, one DB, one auth strategy (JWT). Don't build adapter patterns for providers you might swap later.
Controllers stay thin. Business logic and third-party calls go in services/. Controllers just validate → call service/model → respond.
One file per resource on both api/ (client) and routes/ (server). Don't merge unrelated resources into one file, don't split one resource across multiple files.
No new dependencies without a concrete need. Don't add lodash, moment, redux, etc. "just in case." Plain JS/native Date is enough unless a task genuinely can't be done cleanly without a library.
Env vars only for real secrets/config (MONGO_URI, JWT_SECRET, EDAMAM_APP_ID, EDAMAM_APP_KEY, EMAIL_HOST/PORT/USER/PASS, TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE_NUMBER). No env var for things that never change per environment.
Validation belongs in validators/, not scattered inline in controllers.
Error responses are consistent across every endpoint: { success: false, message: string }. Success responses: { success: true, data: ... }.

# Build Order (do not skip ahead or build multiple phases at once)

Auth (signup/login/logout, JWT, protected routes) + password recovery (email token, phone OTP)
Food search (Edamam Food API) + meal logging (CRUD, portion scaling)
Dashboard (calorie goal, progress bar, macro donut chart, weekly line chart, streak counter)
Health insights (BMI calculator, TDEE calculator, water tracker)
Recipe analyzer (Edamam Recipe API) + custom foods (manual entry)
PDF export (weekly summary)

Confirm each phase runs and works before starting the next. Don't build phase 3's UI while phase 1's auth is still broken.

# Explicitly Out of Scope

Image-based ingredient/health-risk scanner ("Edge Feature")
Mobile app (iOS/Android)
AI-generated meal plans / recommendations
Social features (friend challenges, sharing)
Wearable/fitness tracker integration
Multi-language support
Premium/subscription tier

Do not scaffold placeholders, routes, or model fields for any of the above.
Contentpdf

# 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

# 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

# 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

# 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
