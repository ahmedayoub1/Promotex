using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PromoTex.Data_Access;
using PromoTex.DTO;
using PromoTex.Models;
using PromoTex.ModelViews;
using PromoTex.Utility;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PromoTex.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly IConfiguration config;
        private readonly SignInManager<ApplicationUser> signInManager;
        private readonly ApplicationDbContext applicationDb;

        public AccountController(UserManager<ApplicationUser> userManager, 
            IConfiguration config,
            SignInManager<ApplicationUser> signInManager,
            ApplicationDbContext applicationDb
            )
        {
            this.userManager = userManager;
            this.config = config;
            this.signInManager = signInManager;
            this.applicationDb = applicationDb;
        }
        [HttpPost("Register")]
        public async Task<IActionResult> Register(RegisterDTO userDTO)
        {
            if (ModelState.IsValid)
            {
                ApplicationUser user = new ApplicationUser()
                {
                    Email = userDTO.Email,
                    UserName = userDTO.Email.Split('@')[0],
                    FullName = userDTO.FullName,
                    FullAddress = userDTO.FullName,
                    PhoneNumber = userDTO.PhoneNumber,
                };
                var success = await userManager.CreateAsync(user, userDTO.Password);
                if (success.Succeeded)
                {
                    await userManager.AddToRoleAsync(user , StaticData.CustomerRole);
                    return Ok($"User Created");
                }
                else
                {
                    foreach (var item in success.Errors)
                    {
                        ModelState.AddModelError("", item.Description);
                    }
                }
            }
            return BadRequest(ModelState);
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginDTO UserFromRequest)
        {
            if (ModelState.IsValid)
            {
                var User = await userManager.FindByEmailAsync(UserFromRequest.Email);
                if (User != null)
                {
                    var found = await userManager.CheckPasswordAsync(User, UserFromRequest.Password);
                    if (found)
                    {
                        var UserClaims = new List<Claim>();
                        UserClaims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
                        UserClaims.Add(new Claim(ClaimTypes.NameIdentifier, User.Id));
                        UserClaims.Add(new Claim(ClaimTypes.Name, User.UserName));
                        var UserRoles = await userManager.GetRolesAsync(User);
                        foreach (var Role in UserRoles)
                        {
                            UserClaims.Add(new Claim(ClaimTypes.Role, Role));
                        }
                        var SignInKey =
                           new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                               config["JWT:SecritKey"]));

                        SigningCredentials signingCred =
                            new SigningCredentials
                            (SignInKey, SecurityAlgorithms.HmacSha256);
                        //design our token
                        JwtSecurityToken token = new JwtSecurityToken(
                            issuer: config["IssuerIP"],
                            audience: config["AudienceIP"],
                            expires: DateTime.Now.AddDays(14),
                            claims: UserClaims,
                            signingCredentials: signingCred
                            );
                        //generate token
                        return Ok(new
                        {
                            token = new JwtSecurityTokenHandler().WriteToken(token),
                            expiration = DateTime.Now.AddDays(14)
                        });
                    }
                    ModelState.AddModelError("Password", "Invalid Password");
                }

                ModelState.AddModelError("Email", "Invalid Email");

            }
            return BadRequest(ModelState);
        }
        [HttpPost("Logout")]
        public async Task<IActionResult> Logout()
        {
            await signInManager.SignOutAsync();
            return Ok("User is signed out");
        }

        [HttpGet("GetAllUsers")]
        public async Task<IActionResult> GetAll()
        {
            var users = await userManager.Users.ToListAsync();
            var userList = new List<ApplicationUserVM>();

            foreach (var user in users)
            {
                var roles = await userManager.GetRolesAsync(user);
                userList.Add(new ApplicationUserVM
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    UserName = user.UserName,
                    PhoneNumber = user.PhoneNumber,
                    Roles = roles
                });
            }

            return Ok(userList);
        }
    }
}
