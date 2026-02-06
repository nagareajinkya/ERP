using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SBMS.Parties.Data;
using SBMS.Parties.Entity;
using System.IdentityModel.Tokens.Jwt;


namespace SBMS.Parties.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PartiesController(AppDbContext context)
        {
            _context = context;
        }

        // We use this to extract ID from JWT
        private Guid GetBusinessId()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                    return Guid.Empty;

                // Remove "Bearer " and any accidental spaces
                var token = authHeader.Substring("Bearer ".Length).Trim();

                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                var claim = jwtToken.Claims.FirstOrDefault(c => c.Type == "businessId");

                return claim != null ? Guid.Parse(claim.Value) : Guid.Empty;
            }
            catch
            {
                return Guid.Empty;
            }
        }

        // API ENDPOINTS
        // GET: api/Parties
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Party>>> GetParties([FromQuery] string? search)
        {
            var businessId = GetBusinessId();
            if (businessId == Guid.Empty) return Unauthorized();

            var query = _context.Parties.Where(p => p.BusinessId == businessId);

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                // Default collation behavior depends on DB configuration, but ToLower() ensures consistency

                query = query.Where(p => p.Name.ToLower().Contains(search) || p.PhoneNumber.Contains(search));

            }

            return await query
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        // GET: api/Parties/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Party>> GetParty(long id)
        {
            var businessId = GetBusinessId();
            if (businessId == Guid.Empty) return Unauthorized();

            var party = await _context.Parties
                .FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == businessId);

            if (party == null)
            {
                return NotFound();
            }

            return party;
        }

        // POST: api/Parties
        [HttpPost]
        public async Task<ActionResult<Party>> PostParty(Party party)
        {
            var businessId = GetBusinessId();
            if (businessId == Guid.Empty) return Unauthorized();

            // FORCE BusinessID to be the logged-in user (ignore whatever they sent in JSON)
            party.BusinessId = businessId;

            // Note: CreatedAt and UpdatedAt are handled by AppDbContext.SaveChangesAsync

            _context.Parties.Add(party);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetParty", new { id = party.Id }, party);
        }

        // PUT: api/Parties/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutParty(long id, Party party)
        {
            var businessId = GetBusinessId();
            if (businessId == Guid.Empty) return Unauthorized();

            if (id != party.Id)
            {
                return BadRequest();
            }

            // to check if this party actually belong to this user?
            var exists = await _context.Parties.AnyAsync(p => p.Id == id && p.BusinessId == businessId);
            if (!exists)
            {
                return NotFound(); // Hide that it exists to prevent sniffing
            }

            // Force the business ID to remain correct (prevent hijacking)
            party.BusinessId = businessId;

            // Tell EF Core this object is "Modified"
            _context.Entry(party).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PartyExists(id, businessId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Parties/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParty(long id)
        {
            var businessId = GetBusinessId();
            if (businessId == Guid.Empty) return Unauthorized();

            // Find party only if it belongs to user
            var party = await _context.Parties
                .FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == businessId);

            if (party == null)
            {
                return NotFound();
            }

            _context.Parties.Remove(party);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Parties/5/balance
        // Updates the party balance (add or subtract)
        [HttpPost("{id}/balance")]
        public async Task<IActionResult> UpdateBalance(long id, [FromBody] BalanceUpdateDto dto)
        {
            var businessId = GetBusinessId();
            if (businessId == Guid.Empty) return Unauthorized();

            var party = await _context.Parties.FirstOrDefaultAsync(p => p.Id == id && p.BusinessId == businessId);

            if (party == null)
            {
                return NotFound();
            }

            // Update Balance
            // Logic: Positive Amount adds to balance, Negative subtracts
            party.CurrentBalance += dto.Amount;

            // UpdatedAt
            party.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw;
            }

            return Ok(new { newBalance = party.CurrentBalance });
        }

        public class BalanceUpdateDto
        {
            public decimal Amount { get; set; }
        }

        private bool PartyExists(long id, Guid businessId)
        {
            return _context.Parties.Any(e => e.Id == id && e.BusinessId == businessId);
        }
    }
}