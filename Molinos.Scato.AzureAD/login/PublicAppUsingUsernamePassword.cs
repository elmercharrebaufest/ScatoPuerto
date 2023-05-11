using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace Molinos.Scato.AzureAD.login
{
    public class PublicAppUsingUsernamePassword
    {
        /// <summary>
        /// Constructor of a public application leveraging username passwords to acquire a token
        /// </summary>
        /// <param name="app">MSAL.NET Public client application</param>
        /// <param name="httpClient">HttpClient used to call the protected Web API</param>
        /// <remarks>X  
        /// For more information see https://aka.ms/msal-net-up
        /// </remarks>
        public PublicAppUsingUsernamePassword(IPublicClientApplication app)
        {
            App = app;
        }
        protected IPublicClientApplication App { get; private set; }

        /// <summary>
        /// Acquires a token from the token cache, or Username/password
        /// </summary>
        /// <returns>An AuthenticationResult if the user successfully signed-in, or otherwise <c>null</c></returns>
        public async Task<AuthenticationResult> AcquireATokenFromCacheOrUsernamePasswordAsync(IEnumerable<String> scopes, string username, string password)
        {
            AuthenticationResult result = null;
            var accounts = await App.GetAccountsAsync();

            if (accounts.Any())
            {
                try
                {
                    // Attempt to get a token from the cache (or refresh it silently if needed)
                    result = await (App as PublicClientApplication).AcquireTokenSilent(scopes, accounts.FirstOrDefault())
                        .ExecuteAsync();
                }
                catch (MsalUiRequiredException)
                {
                    // No token for the account. Will proceed below
                }
            }

            // Cache empty or no token for account in the cache, attempt by username/password
            if (result == null)
            {
                result = await GetTokenForWebApiUsingUsernamePasswordAsync(scopes, username, password).ConfigureAwait(false);
            }

            return result;
        }

        /// <summary>
        /// Gets an access token so that the application accesses the web api in the name of the user
        /// who is signed-in Windows (for a domain joined or AAD joined machine)
        /// </summary>
        /// <returns>An authentication result, or null if the user canceled sign-in</returns>
        private async Task<AuthenticationResult> GetTokenForWebApiUsingUsernamePasswordAsync(IEnumerable<string> scopes, string username, string password)
        {
            AuthenticationResult result = null;
            try
            {
                //result = await App.AcquireTokenByUsernamePassword(scopes, @"lucas.olivella@molinosagro.com.ar", "inicio00").ExecuteAsync(CancellationToken.None).ConfigureAwait(false);
                result = await App.AcquireTokenByUsernamePassword(scopes, username, password).ExecuteAsync().ConfigureAwait(false);
            }
            catch (MsalUiRequiredException ex)
            {
            }
            return result;
        }
    }
}