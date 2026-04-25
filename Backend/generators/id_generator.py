import random
import datetime
from typing import Literal

def generate_custom_id(prefix: str, length: int,
    use_ci: bool = True,
    use_prefix: bool = True,
    use_date: bool = True,
    use_random: bool = True) -> str:
    """
    Core ID generator.
    Format: [PREFIX][MMYY][RANDOM_DIGITS]
    """
    if not any([use_prefix, use_date, use_random]):
        raise ValueError("At least one of use_prefix, use_date, or use_random must be True")
    
    date_part = datetime.datetime.now().strftime("%m%y")
    # Generates a random number of the specified length (e.g., 6 digits -> 100000 to 999999)
    random_part = random.randint(10**(length-1), (10**length)-1)

    parts=[
        "CI" if use_ci else "",
        prefix if use_prefix else "",
        date_part if use_date else "",
        str(random_part) if use_random else ""
    ]
    return f"{''.join(parts)}"
    
    
    

def generate_admin_id() -> str:
    """Generates a unique Admin ID with 'AD' prefix."""
    return generate_custom_id(prefix="AD", length=6)

def generate_student_id() -> str:
    """Generates a unique Student ID with 'ST' prefix."""
    return generate_custom_id(prefix="ST", length=6)

def generate_institution_id() -> str:
    """Generates a unique Institution ID with 'IN' prefix."""
    return generate_custom_id(prefix="IN", length=6)

def generate_batch_id() -> str:
    return generate_custom_id(prefix="B-", length=4, use_date=False, use_ci=False)
# def userid_generator() -> str:
#     """
#     Legacy wrapper for existing accounts app compatibility.
#     Generates a standard 'CI' prefixed ID.
#     """
#     return generate_custom_id(prefix="CI")


# print(generate_institution_id())
# print(generate_admin_id())
# print(generate_student_id())
# print(generate_batch_id())
