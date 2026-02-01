using Microsoft.EntityFrameworkCore;
using SBMS.Parties.Entity;
namespace SBMS.Parties.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
            public DbSet<Party> Parties { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //  This is for forcing the Enum to save as "CUSTOMER" (text) not 0 (number)
            modelBuilder.Entity<Party>()
                .Property(p => p.Type)
                .HasConversion<string>();
        }


        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries<Party>()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;

                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
    
}
