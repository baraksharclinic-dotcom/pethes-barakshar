# Academy setup before launch

- The website is connected to the existing external Supabase project. Email sign-in settings have not been verified against hosted configuration.
- Create the owner account in the website, confirm its email, then have an authorized database administrator grant its user ID the `admin` role in `public.user_roles`. The app never promotes users from their profile metadata.
- Four courses, their prices, schedules, venue, educational articles, FAQ turnaround promises and history are sample content, not verified business facts. Replace them before launch.
- Lesson Vimeo URLs are sample provider videos, not academy teaching recordings. Replace them with your Vimeo/Bunny embed URLs. Set allowed playback domains in the provider dashboard and disable downloads. Enrollment gating alone cannot prevent copied provider URLs, screen recording or sharing already downloaded PDFs.
- Upload PDFs from Admin → Lessons. Notes are private and links expire after 60 seconds. Approved student access ends at the configured expiry. Scheduled lessons remain inaccessible until release.
- Admin → Enrollments approves or rejects payment references and chooses access duration. Transfer instructions must be confirmed by the academy; no payment collection provider is enabled.
- Calendar events export to an `.ics` file. Times display in IST; this is calendar export, not a connected Google Calendar synchronization.
- English and Marathi navigation, course titles/summaries and FAQ questions are included. Full Marathi educational articles, FAQ answers and administration copy require translation.
- Public browser checks and routing tests passed. Authenticated approval, playback and progress checks cannot be completed with the externally managed backend without a test session.
- Database linter reports four existing warnings for callable security-definer access/outline helpers; their intentional audience and safe projections should be reviewed before launch.