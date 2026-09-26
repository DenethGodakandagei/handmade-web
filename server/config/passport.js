import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/UserModel.js';

/**
 * Google OAuth 2.0 / OpenID Connect strategy.
 *
 * Grant type : Authorization Code
 * Scopes     : openid, profile, email
 *
 * On successful authentication Google returns an ID token (OIDC) and an
 * access token.  We extract the profile, then either:
 *   1. Find an existing user by googleId   → return them
 *   2. Find a local user with the same verified email → link the Google account
 *   3. Create a brand-new user with authProvider: 'google'
 */
const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/v1/auth/google/callback',
        scope: ['openid', 'profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const { id: googleId, displayName, emails, photos } = profile;
          const email = emails?.[0]?.value;
          const profilePicture = photos?.[0]?.value;

          // 1. Already linked – return the user
          let user = await User.findOne({ googleId });
          if (user) {
            return done(null, user);
          }

          // 2. Existing local account with same email – link Google ID
          if (email) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = googleId;
              user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
              if (!user.profilePicture && profilePicture) {
                user.profilePicture = profilePicture;
              }
              await user.save({ validateModifiedOnly: true });
              return done(null, user);
            }
          }

          // 3. New user – create with Google provider
          user = await User.create({
            name: displayName,
            email,
            googleId,
            authProvider: 'google',
            profilePicture,
          });

          return done(null, user);
        } catch (err) {
          console.error('Passport Google Strategy error:', err);
          return done(err, null);
        }
      }
    )
  );

  // Serialize / deserialize (needed even if we only use JWT, so passport
  // can attach the user to req during the callback redirect).
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export default configurePassport;
