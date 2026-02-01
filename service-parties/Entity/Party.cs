using SBMS.Parties.Entity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SBMS.Parties.Entity
{
    [Table("parties")]
    public class Party
    {
        [Key]
        [Column("party_id")]
        public long Id { get; set; }

        [Column("business_id")]
        public Guid BusinessId { get; set; }

        [Required]
        [Column("party_type")]
        public PartyType Type { get; set; } // Enum: CUSTOMER or SUPPLIER

        [Required]
        [Column("party_name")]
        public string Name { get; set; } = string.Empty;

        [Column("phone_number")]
        public string? PhoneNumber { get; set; }

        [Column("city")]
        public string? City { get; set; }

        [Column("gstin")]
        public string? Gstin { get; set; }

        [Column("current_balance")]
        public decimal CurrentBalance { get; set; } = 0;
        // Logic: Positive (+) = Receivable, Negative (-) = Payable

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}